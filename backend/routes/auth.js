import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import DoctorLink from '../models/DoctorLink.js';
import generateToken from '../utils/generateToken.js';

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['patient', 'doctor'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password, role, doctorIds, ...additionalData } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      role,
      ...additionalData
    });

    // If patient provided doctorIds, create up to 4 pending link requests
    let createdDoctorLinks = [];
    if (role === 'patient' && Array.isArray(doctorIds) && doctorIds.length > 0) {
      try {
        // Only allow unique IDs and max 4
        const uniqueIds = [...new Set(doctorIds.map(String))].slice(0, 4);
        // Ensure they are valid doctors
        const doctors = await User.find({ _id: { $in: uniqueIds }, role: 'doctor' }).select('_id');
        const validIds = doctors.map(d => d._id.toString());
        const toCreate = validIds.map(docId => ({ patientId: user._id, doctorId: docId }));
        if (toCreate.length > 0) {
          createdDoctorLinks = await DoctorLink.insertMany(toCreate, { ordered: false });
        }
      } catch (e) {
        // Do not fail registration if link creation has duplicates or errors
        console.warn('Doctor link creation during signup warning:', e?.message || e);
      }
    }

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
        doctorLinksRequested: createdDoctorLinks.length
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        role: user.role,
        fullName: user.fullName || user.doctorName,
        token: generateToken(user._id)
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;

