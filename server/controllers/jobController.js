import { CohereClientV2 } from 'cohere-ai';
import dotenv from 'dotenv';
import Job from '../models/Job.js';

dotenv.config();

const cohere = new CohereClientV2({
  token: process.env.COHERE_API_KEY,
});

// 🧠 Cosine similarity calculation
const cosineSim = (a, b) => {
  const dot = a.reduce((acc, val, i) => acc + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((acc, val) => acc + val * val, 0));
  const magB = Math.sqrt(b.reduce((acc, val) => acc + val * val, 0));
  return dot / (magA * magB);
};

// 📥 GET all jobs
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json(jobs);
  } catch (err) {
    console.error('Error fetching jobs:', err);
    res.status(500).json({ message: 'Failed to fetch jobs' });
  }
};

// 📝 POST create a job
export const createJob = async (req, res) => {
  try {
    const { title, company, location, skillsRequired, jobType } = req.body;
    const job = await Job.create({ title, company, location, skillsRequired, jobType });
    res.status(201).json(job);
  } catch (err) {
    console.error('Error creating job:', err);
    res.status(500).json({ message: 'Failed to create job' });
  }
};

// ❌ DELETE a job
export const deleteJob = async (req, res) => {
  try {
    await Job.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Job deleted' });
  } catch (err) {
    console.error('Error deleting job:', err);
    res.status(500).json({ message: 'Failed to delete job' });
  }
};

// 🔍 POST recommend jobs
export const recommendJobs = async (req, res) => {
  try {
    const { name, experience = 0, skills = [], preferences = '' } = req.body;

    if (!name || !Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({ message: 'Name and skills are required' });
    }

    // Optional skill expansion
    const skillSynonyms = {
      'data engineering': ['etl', 'pipelines', 'big data'],
      'aws': ['cloud', 's3'],
      'airflow': ['workflow orchestration'],
    };

    const expandedSkills = skills.flatMap(skill => [skill, ...(skillSynonyms[skill.toLowerCase()] || [])]);

    const queryText = `Skills: ${expandedSkills.join(', ')}. Experience: ${experience} years. Preferences: ${preferences}.`;

    const jobs = await Job.find();
    const jobDescriptions = jobs.map(job =>
      `${job.title} at ${job.company} in ${job.location}. Skills: ${job.skillsRequired.join(', ')}. Type: ${job.jobType}.`
    );

    const [queryRes, jobRes] = await Promise.all([
      cohere.embed({
        texts: [queryText],
        model: 'embed-english-v3.0',
        inputType: 'search_query',
        embeddingTypes: ['float']
      }),
      cohere.embed({
        texts: jobDescriptions,
        model: 'embed-english-v3.0',
        inputType: 'search_document',
        embeddingTypes: ['float']
      }),
    ]);

    const queryEmbedding = queryRes.embeddings.float[0];
    const jobEmbeddings = jobRes.embeddings.float;

    const scoredJobs = jobs.map((job, i) => ({
      ...job.toObject(),
      score: cosineSim(queryEmbedding, jobEmbeddings[i]),
    }));

    const topMatches = scoredJobs.sort((a, b) => b.score - a.score).slice(0, 3);

    res.status(200).json({ candidate: name, matches: topMatches });
  } catch (err) {
    console.error("Job recommendation failed:", err.message, err.stack);
    res.status(500).json({ message: 'Failed to recommend jobs' });
  }
};
