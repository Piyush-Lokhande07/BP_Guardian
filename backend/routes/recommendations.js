import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect, authorize } from '../middleware/auth.js';
import Recommendation from '../models/Recommendation.js';
import { generateRecommendation } from '../services/aiService.js';
import DoctorLink from '../models/DoctorLink.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   POST /api/recommendations/generate
// @desc    Generate a new AI recommendation for patient
// @access  Private (Patient only)
router.post('/generate', async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can generate recommendations'
      });
    }

    // Generate recommendation using AI service
    const recommendationData = await generateRecommendation(req.user._id);

    // Optional: assign to approved doctors provided in body.assignedDoctorIds (max 4)
    let assignedDoctorIds = [];
    if (Array.isArray(req.body.assignedDoctorIds) && req.body.assignedDoctorIds.length > 0) {
      const links = await DoctorLink.find({
        patientId: req.user._id,
        doctorId: { $in: req.body.assignedDoctorIds },
        status: 'approved'
      }).select('doctorId');
      assignedDoctorIds = links.map(l => l.doctorId);
    }

    // Save to database
    const recommendation = await Recommendation.create({
      patientId: req.user._id,
      ...recommendationData,
      assignedDoctorIds,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      data: recommendation
    });
  } catch (error) {
    console.error('Generate recommendation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate recommendation'
    });
  }
});

// @route   GET /api/recommendations
// @desc    Get recommendations (for patient or doctor)
// @access  Private
router.get('/', async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    } else if (req.user.role === 'doctor' && req.query.patientId) {
      query.patientId = req.query.patientId;
    }

    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }

    // If doctor is requesting without patientId, optionally show assigned-to-me only
    if (req.user.role === 'doctor' && !req.query.patientId && (req.query.assignedToMe === 'true')) {
      query.assignedDoctorIds = req.user._id;
    }

    const recommendations = await Recommendation.find(query)
      .populate('patientId', 'fullName email')
      .populate('doctorId', 'doctorName email')
      .populate('assignedDoctorIds', 'doctorName email specialization')
      .sort({ createdAt: -1 })
      .limit(parseInt(req.query.limit) || 50);

    const countsByStatus = recommendations.reduce((acc, r) => { acc[r.status] = (acc[r.status] || 0) + 1; return acc; }, {});

    res.json({
      success: true,
      data: recommendations,
      count: recommendations.length,
      countsByStatus
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/recommendations/pending
// @desc    Get pending recommendations (for doctor dashboard)
// @access  Private (Doctor only)
router.get('/pending', authorize('doctor'), async (req, res) => {
  try {
    const recommendations = await Recommendation.find({ status: 'pending', assignedDoctorIds: req.user._id })
      .populate('patientId', 'fullName email dateOfBirth gender')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: recommendations,
      count: recommendations.length
    });
  } catch (error) {
    console.error('Get pending recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/recommendations/:id
// @desc    Get a single recommendation
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    }

    const recommendation = await Recommendation.findOne(query)
      .populate('patientId', 'fullName email dateOfBirth gender')
      .populate('doctorId', 'doctorName email');

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found'
      });
    }

    res.json({
      success: true,
      data: recommendation
    });
  } catch (error) {
    console.error('Get recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/recommendations/:id/approve
// @desc    Approve a recommendation
// @access  Private (Doctor only)
router.put('/:id/approve', [
  body('doctorNotes').optional().isString()
], authorize('doctor'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const recommendation = await Recommendation.findById(req.params.id);

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found'
      });
    }

    if (recommendation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Recommendation is not pending'
      });
    }

    // Ensure doctor is assigned to review
    if (!recommendation.assignedDoctorIds?.some(id => id.toString() === req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized to review this recommendation' });
    }

    recommendation.status = 'approved';
    recommendation.doctorId = req.user._id;
    recommendation.doctorNotes = req.body.doctorNotes || '';
    recommendation.reviewedAt = new Date();
    await recommendation.save();

    res.json({
      success: true,
      data: recommendation,
      message: 'Recommendation approved successfully'
    });
  } catch (error) {
    console.error('Approve recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/recommendations/:id/reject
// @desc    Reject a recommendation
// @access  Private (Doctor only)
router.put('/:id/reject', [
  body('doctorNotes').notEmpty().withMessage('Doctor notes are required for rejection')
], authorize('doctor'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const recommendation = await Recommendation.findById(req.params.id);

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found'
      });
    }

    if (recommendation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Recommendation is not pending'
      });
    }

    // Ensure doctor is assigned to review
    if (!recommendation.assignedDoctorIds?.some(id => id.toString() === req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized to review this recommendation' });
    }

    recommendation.status = 'rejected';
    recommendation.doctorId = req.user._id;
    recommendation.doctorNotes = req.body.doctorNotes;
    recommendation.reviewedAt = new Date();
    await recommendation.save();

    res.json({
      success: true,
      data: recommendation,
      message: 'Recommendation rejected successfully'
    });
  } catch (error) {
    console.error('Reject recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/recommendations/:id/modify
// @desc    Approve with modifications
// @access  Private (Doctor only)
router.put('/:id/modify', [
  body('doctorNotes').notEmpty().withMessage('Doctor notes with modifications are required'),
  body('medications').optional().isArray()
], authorize('doctor'), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const recommendation = await Recommendation.findById(req.params.id);

    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found'
      });
    }

    if (recommendation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Recommendation is not pending'
      });
    }

    // Ensure doctor is assigned to review
    if (!recommendation.assignedDoctorIds?.some(id => id.toString() === req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized to review this recommendation' });
    }

    // Update medications if provided
    if (req.body.medications) {
      recommendation.medications = req.body.medications;
    }

    recommendation.status = 'modified';
    recommendation.doctorId = req.user._id;
    recommendation.doctorNotes = req.body.doctorNotes;
    recommendation.reviewedAt = new Date();
    await recommendation.save();

    res.json({
      success: true,
      data: recommendation,
      message: 'Recommendation modified and approved successfully'
    });
  } catch (error) {
    console.error('Modify recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;

// New routes below

// @route   POST /api/recommendations/:id/assign
// @desc    Assign recommendation to approved doctors (patient only)
// @access  Private (Patient only)
router.post('/:id/assign', async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ success: false, message: 'Only patients can assign doctors' });
    }

    const recommendation = await Recommendation.findOne({ _id: req.params.id, patientId: req.user._id });
    if (!recommendation) {
      return res.status(404).json({ success: false, message: 'Recommendation not found' });
    }

    const { doctorIds } = req.body;
    if (!Array.isArray(doctorIds) || doctorIds.length === 0) {
      return res.status(400).json({ success: false, message: 'doctorIds must be a non-empty array' });
    }

    // Only allow approved links
    const links = await DoctorLink.find({ patientId: req.user._id, doctorId: { $in: doctorIds }, status: 'approved' }).select('doctorId');
    const approvedIds = new Set(links.map(l => l.doctorId.toString()));
    const incoming = [...new Set(doctorIds.map(String))].filter(id => approvedIds.has(id));

    recommendation.assignedDoctorIds = Array.from(new Set([...(recommendation.assignedDoctorIds || []).map(id => id.toString()), ...incoming]));
    await recommendation.save();

    res.json({ success: true, data: recommendation, message: 'Doctors assigned for approval' });
  } catch (error) {
    console.error('Assign doctors to recommendation error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/recommendations/:id/select-medications
// @desc    Patient selects affordable meds subset and optionally assigns doctors
// @access  Private (Patient only)
router.put('/:id/select-medications', async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ success: false, message: 'Only patients can select medications' });
    }

    const recommendation = await Recommendation.findOne({ _id: req.params.id, patientId: req.user._id });
    if (!recommendation) {
      return res.status(404).json({ success: false, message: 'Recommendation not found' });
    }

    if (!['pending'].includes(recommendation.status)) {
      return res.status(400).json({ success: false, message: 'Cannot modify selection after review' });
    }

    const { selectedMedications, doctorIds } = req.body;
    if (!Array.isArray(selectedMedications) || selectedMedications.length === 0) {
      return res.status(400).json({ success: false, message: 'selectedMedications must be a non-empty array' });
    }

    // Validate each selected medication contains at least name/cost/frequency/dosage
    const validSelected = selectedMedications.filter(m => m && m.name && m.dosage && m.frequency && (typeof m.cost === 'number'));
    if (validSelected.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one valid medication is required' });
    }

    recommendation.patientSelectedMedications = validSelected;
    recommendation.selectedAt = new Date();

    // Optionally assign doctors (must be approved links)
    if (Array.isArray(doctorIds) && doctorIds.length > 0) {
      const links = await DoctorLink.find({ patientId: req.user._id, doctorId: { $in: doctorIds }, status: 'approved' }).select('doctorId');
      const approvedIds = new Set(links.map(l => l.doctorId.toString()));
      const incoming = [...new Set(doctorIds.map(String))].filter(id => approvedIds.has(id));
      recommendation.assignedDoctorIds = Array.from(new Set([...(recommendation.assignedDoctorIds || []).map(id => id.toString()), ...incoming]));
    }

    await recommendation.save();

    res.json({ success: true, data: recommendation, message: 'Selection saved and doctors assigned (if provided)' });
  } catch (error) {
    console.error('Select medications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

