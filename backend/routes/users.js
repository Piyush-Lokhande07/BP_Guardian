import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import DoctorLink from '../models/DoctorLink.js';

const router = express.Router();

// Public route for getting doctors (for signup - no auth required)
router.get('/doctors', async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' })
      .select('-password')
      .sort({ doctorName: 1 });

    res.json({
      success: true,
      data: doctors,
      count: doctors.length
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// All other routes require authentication
router.use(protect);

// @route   GET /api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/me
// @desc    Update current user profile
// @access  Private
router.put('/me', async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Don't allow password or role updates through this route
    const { password, role, email, ...updateData } = req.body;

    // Update user fields
    Object.assign(user, updateData);
    await user.save();

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/patients
// @desc    Get all patients (for doctor dashboard)
// @access  Private (Doctor only)
router.get('/patients', async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can view patient list'
      });
    }

    const patients = await User.find({ role: 'patient' })
      .select('-password')
      .sort({ fullName: 1 });

    res.json({
      success: true,
      data: patients,
      count: patients.length
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/patients/:id
// @desc    Get patient details (for doctor)
// @access  Private (Doctor only)
router.get('/patients/:id', async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Only doctors can view patient details'
      });
    }

    const patient = await User.findById(req.params.id)
      .select('-password');

    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Get patient details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});


export default router;

// New routes below

// @route   POST /api/users/doctor-requests
// @desc    Patient requests to link with up to 4 doctors
// @access  Private (Patient only)
router.post('/doctor-requests', async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ success: false, message: 'Only patients can request doctors' });
    }

    const { doctorIds } = req.body;
    if (!Array.isArray(doctorIds) || doctorIds.length === 0) {
      return res.status(400).json({ success: false, message: 'doctorIds must be a non-empty array' });
    }

    // Enforce max 4 active+pending links
    const existingLinks = await DoctorLink.find({ patientId: req.user._id, status: { $in: ['requested', 'approved'] } });
    const existingDoctorSet = new Set(existingLinks.map(l => l.doctorId.toString()));

    const uniqueIncoming = [...new Set(doctorIds.map(String))].filter(id => !existingDoctorSet.has(id));
    const allowedSlots = Math.max(0, 4 - existingDoctorSet.size);
    const toCreate = uniqueIncoming.slice(0, allowedSlots);

    if (toCreate.length === 0) {
      return res.status(200).json({ success: true, message: 'No new requests created (limit reached or already requested/linked)', data: existingLinks });
    }

    // Validate doctors exist and are role=doctor
    const doctors = await User.find({ _id: { $in: toCreate }, role: 'doctor' }).select('_id');
    const validIds = new Set(doctors.map(d => d._id.toString()));
    const finalCreates = toCreate.filter(id => validIds.has(id));

    const created = await DoctorLink.insertMany(finalCreates.map(docId => ({ patientId: req.user._id, doctorId: docId })), { ordered: false });

    res.status(201).json({ success: true, data: created });
  } catch (error) {
    console.error('Doctor request error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/users/my-doctors
// @desc    Patient views approved doctors and request statuses
// @access  Private (Patient only)
router.get('/my-doctors', async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ success: false, message: 'Only patients can view their doctors' });
    }

    const links = await DoctorLink.find({ patientId: req.user._id })
      .populate('doctorId', 'doctorName email specialization')
      .sort({ requestedAt: -1 });

    const approved = links.filter(l => l.status === 'approved');
    const requested = links.filter(l => l.status === 'requested');
    const declined = links.filter(l => l.status === 'declined');

    res.json({ success: true, data: { approved, requested, declined }, counts: { approved: approved.length, requested: requested.length, declined: declined.length } });
  } catch (error) {
    console.error('My doctors error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


