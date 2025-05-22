import express from 'express';
import {
  registerUser,
  authUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  validateToken
} from '../controllers/userController.js';

import { protect } from '../middleware/authMiddleware.js';
import {
  validateRegister,
  validateLogin,
  validateUpdateProfile
} from '../middleware/validators.js';

const router = express.Router();

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, authUser);
router.post('/logout', protect, logoutUser);
router.get('/validateToken', validateToken);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, validateUpdateProfile, updateUserProfile);

export default router;
