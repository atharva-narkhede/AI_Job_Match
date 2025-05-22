import express from 'express';
import {
  getJobs,
  createJob,
  deleteJob,
  recommendJobs
} from '../controllers/jobController.js';

const router = express.Router();

router.get('/', getJobs);
router.post('/', createJob);
router.delete('/:id', deleteJob);
router.post('/recommend', recommendJobs); // ✅ AI endpoint

export default router;
