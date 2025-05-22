import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Jobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [recommending, setRecommending] = useState(false);

  // Fetch all jobs on load
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/jobs');
        setJobs(res.data);
      } catch (err) {
        setError('❌ Failed to fetch jobs.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleMatchClick = async () => {
    setRecommending(true);
    try {
      const res = await axios.post(
        'http://localhost:5000/api/jobs/recommend',
        {
          name: user.username,
          experience: user.experience,
          skills: user.skills,
          preferences: user.jobType,
        },
        { withCredentials: true }
      );
      setRecommended(res.data.matches);
    } catch (err) {
      setError('❌ Failed to fetch recommendations.');
    } finally {
      setRecommending(false);
    }
  };

  return (
    <div className="px-6 py-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold text-center mb-6 text-blue-700">AI Job Match Platform</h2>

      <div className="flex justify-center mb-8">
        <button
          onClick={handleMatchClick}
          disabled={recommending}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          {recommending ? '🔍 Finding Matches...' : '🎯 Find My Matches'}
        </button>
      </div>

      {error && <p className="text-center text-red-500 mb-6">{error}</p>}

      {/* Recommended Jobs */}
      {recommended.length > 0 && (
        <div className="mb-10">
          <h3 className="text-xl font-semibold text-center mb-4 text-green-700">
            🎯 Top 3 Recommended Jobs for You
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {recommended.map((job) => (
              <div key={job._id} className="bg-green-50 border-l-4 border-green-500 p-4 rounded shadow">
                <h4 className="text-lg font-bold">{job.title}</h4>
                <p className="text-sm text-gray-600">{job.company} – {job.location}</p>
                <p className="mt-1 text-sm">Skills: {job.skillsRequired.join(', ')}</p>
                <p className="mt-1 text-sm">Type: {job.jobType}</p>
                <p className="mt-1 text-sm font-semibold text-green-700">
                  Match Score: {(job.score * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
          <hr className="border-gray-300 mb-6" />
        </div>
      )}

      {/* All Jobs */}
      <h3 className="text-xl font-semibold mb-4 text-center">📄 All Job Listings</h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs.map((job) => (
          <div key={job._id} className="bg-white border p-4 rounded shadow">
            <h4 className="text-lg font-bold">{job.title}</h4>
            <p className="text-sm text-gray-600">{job.company} – {job.location}</p>
            <p className="mt-1 text-sm">Skills: {job.skillsRequired.join(', ')}</p>
            <p className="mt-1 text-sm">Type: {job.jobType}</p>
          </div>
        ))}
      </div>

      {loading && (
        <p className="text-center mt-10 text-gray-500">Loading jobs...</p>
      )}
    </div>
  );
}
