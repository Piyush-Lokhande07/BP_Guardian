import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import Recommendation from '../models/Recommendation.js';
import User from '../models/User.js';
import BPReading from '../models/BPReading.js';
import DoctorLink from '../models/DoctorLink.js';

const router = express.Router();

// All routes require doctor role
router.use(protect);
router.use(authorize('doctor'));

// @route   GET /api/doctor-dashboard/stats
// @desc    Get dashboard statistics
// @access  Private (Doctor only)
router.get('/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Pending recommendations count
    const pendingCount = await Recommendation.countDocuments({
      status: 'pending'
    });

    // Approved today count
    const approvedToday = await Recommendation.countDocuments({
      status: 'approved',
      reviewedAt: { $gte: today }
    });

    // Modified today count
    const modifiedToday = await Recommendation.countDocuments({
      status: 'modified',
      reviewedAt: { $gte: today }
    });

    // Total patients count
    const totalPatients = await User.countDocuments({
      role: 'patient'
    });

    res.json({
      success: true,
      data: {
        pendingReviews: pendingCount,
        approvedToday,
        modifiedToday,
        totalPatients
      }
    });
  } catch (error) {
    console.error('Get doctor dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/doctor-dashboard/patient-overview/:patientId
// @desc    Get comprehensive patient overview
// @access  Private (Doctor only)
router.get('/patient-overview/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;

    // Get patient info
    const patient = await User.findById(patientId)
      .select('-password');

    if (!patient || patient.role !== 'patient') {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    // Get recent BP readings (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const bpReadings = await BPReading.find({
      patientId,
      timestamp: { $gte: thirtyDaysAgo }
    })
      .sort({ timestamp: -1 })
      .limit(100);

    // Calculate BP statistics
    const avgSystolic = bpReadings.length > 0
      ? Math.round(bpReadings.reduce((sum, r) => sum + r.systolic, 0) / bpReadings.length)
      : 0;
    const avgDiastolic = bpReadings.length > 0
      ? Math.round(bpReadings.reduce((sum, r) => sum + r.diastolic, 0) / bpReadings.length)
      : 0;

    // Get all recommendations for this patient
    const recommendations = await Recommendation.find({ patientId })
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      data: {
        patient,
        bpStats: {
          readings: bpReadings,
          count: bpReadings.length,
          avgSystolic,
          avgDiastolic,
          latest: bpReadings[0] || null
        },
        recommendations: {
          all: recommendations,
          pending: recommendations.filter(r => r.status === 'pending'),
          approved: recommendations.filter(r => r.status === 'approved'),
          rejected: recommendations.filter(r => r.status === 'rejected')
        }
      }
    });
  } catch (error) {
    console.error('Get patient overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;

// New routes below

// @route   GET /api/doctor-dashboard/requests
// @desc    View incoming patient link requests
// @access  Private (Doctor only)
router.get('/requests', async (req, res) => {
  try {
    const requests = await DoctorLink.find({ doctorId: req.user._id, status: 'requested' })
      .populate('patientId', 'fullName email dateOfBirth gender')
      .sort({ requestedAt: -1 });

    res.json({ success: true, data: requests, count: requests.length });
  } catch (error) {
    console.error('Get doctor requests error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/doctor-dashboard/requests/:id/accept
// @desc    Accept a patient link request
// @access  Private (Doctor only)
router.put('/requests/:id/accept', async (req, res) => {
  try {
    const link = await DoctorLink.findOne({ _id: req.params.id, doctorId: req.user._id });
    if (!link) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    if (link.status !== 'requested') {
      return res.status(400).json({ success: false, message: 'Request already processed' });
    }
    link.status = 'approved';
    link.respondedAt = new Date();
    await link.save();
    res.json({ success: true, data: link, message: 'Request approved' });
  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/doctor-dashboard/requests/:id/decline
// @desc    Decline a patient link request
// @access  Private (Doctor only)
router.put('/requests/:id/decline', async (req, res) => {
  try {
    const link = await DoctorLink.findOne({ _id: req.params.id, doctorId: req.user._id });
    if (!link) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }
    if (link.status !== 'requested') {
      return res.status(400).json({ success: false, message: 'Request already processed' });
    }
    link.status = 'declined';
    link.respondedAt = new Date();
    await link.save();
    res.json({ success: true, data: link, message: 'Request declined' });
  } catch (error) {
    console.error('Decline request error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/doctor-dashboard/assigned-patients
// @desc    List patients with approved link to this doctor
// @access  Private (Doctor only)
router.get('/assigned-patients', async (req, res) => {
  try {
    const links = await DoctorLink.find({ doctorId: req.user._id, status: 'approved' })
      .populate('patientId', 'fullName email dateOfBirth gender')
      .sort({ respondedAt: -1 });

    res.json({ success: true, data: links, count: links.length });
  } catch (error) {
    console.error('Assigned patients error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


