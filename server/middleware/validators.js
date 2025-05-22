import { check } from 'express-validator';

export const validateRegister = [
  check('username', 'Username is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
];

export const validateLogin = [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists(),
];

export const validateUpdateProfile = [
  check('username', 'Username is required').optional().not().isEmpty(),
  check('location', 'Location must be a string').optional().isString(),
  check('experience', 'Experience must be a number').optional().isNumeric(),
  check('skills', 'Skills must be an array of strings').optional().isArray(),
  check('jobType', 'Job type must be remote, onsite, or any').optional().isIn(['remote', 'onsite', 'any']),
  check('password', 'Password must be at least 6 characters').optional().isLength({ min: 6 }),
];
