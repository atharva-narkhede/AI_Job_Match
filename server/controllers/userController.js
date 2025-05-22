import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { validationResult } from 'express-validator';
import dotenv from 'dotenv';

dotenv.config();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { username, email, password, location, experience, skills, jobType } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({
      username,
      email,
      password,
      location,
      experience,
      skills,
      jobType
    });


    res.status(200).json({
      message: 'User registered successfully',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        location: user.location,
        experience: user.experience,
        skills: user.skills,
        jobType: user.jobType
      }
    });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const authUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && await user.matchPassword(password)) {
      const token = generateToken(user._id);
      user.token = token;
      await user.save();

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      });

      res.json({ _id: user._id, username: user.username, email: user.email, token });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.token = null;
      await user.save();
    }

    res.cookie('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0),
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        location: user.location,
        experience: user.experience,
        skills: user.skills,
        jobType: user.jobType
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUserProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.username = req.body.username || user.username;
      user.location = req.body.location || user.location;
      user.experience = req.body.experience || user.experience;
      user.skills = req.body.skills || user.skills;
      user.jobType = req.body.jobType || user.jobType;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();
      const token = generateToken(updatedUser._id);
      user.token = token;
      await user.save();

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000,
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      });

      res.json({
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        location: updatedUser.location,
        experience: updatedUser.experience,
        skills: updatedUser.skills,
        jobType: updatedUser.jobType,
        token
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const validateToken = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user || user.token !== token) return res.status(401).json({ message: 'Invalid token' });

    res.status(200).json({
      message: 'Token is valid',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        location: user.location,
        experience: user.experience,
        skills: user.skills,
        jobType: user.jobType
      }
    });
  } catch {
    res.status(401).json({ message: 'Token validation failed' });
  }
};
