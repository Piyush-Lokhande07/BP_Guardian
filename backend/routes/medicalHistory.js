import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import MedicalRecord from '../models/MedicalRecord.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   POST /api/medical-history
// @desc    Create a new medical record
// @access  Private (Patient only)
router.post('/', [
  body('type').isIn(['condition', 'medication', 'allergy', 'surgery']),
  body('title').notEmpty(),
  body('description').notEmpty(),
  body('status').optional().isIn(['active', 'resolved', 'ongoing'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can create medical records'
      });
    }

    const record = await MedicalRecord.create({
      patientId: req.user._id,
      ...req.body,
      date: req.body.date ? new Date(req.body.date) : new Date()
    });

    res.status(201).json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('Create medical record error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/medical-history
// @desc    Get all medical records for current patient
// @access  Private (Patient) or (Doctor viewing patient data)
router.get('/', async (req, res) => {
  try {
    let query = {};
    
    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    } else if (req.user.role === 'doctor' && req.query.patientId) {
      query.patientId = req.query.patientId;
    } else if (req.user.role === 'doctor') {
      return res.status(400).json({
        success: false,
        message: 'Doctor must specify patientId to view medical history'
      });
    }

    // Optional filters
    if (req.query.type) {
      query.type = req.query.type;
    }
    if (req.query.status) {
      query.status = req.query.status;
    }

    const records = await MedicalRecord.find(query)
      .sort({ date: -1 });

    // Group by type
    const grouped = {
      conditions: records.filter(r => r.type === 'condition'),
      medications: records.filter(r => r.type === 'medication'),
      allergies: records.filter(r => r.type === 'allergy'),
      surgeries: records.filter(r => r.type === 'surgery')
    };

    res.json({
      success: true,
      data: records,
      grouped,
      stats: {
        total: records.length,
        conditions: grouped.conditions.length,
        medications: grouped.medications.length,
        allergies: grouped.allergies.length,
        surgeries: grouped.surgeries.length
      }
    });
  } catch (error) {
    console.error('Get medical history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/medical-history/:id
// @desc    Get a single medical record
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    }

    const record = await MedicalRecord.findOne(query);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('Get medical record error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/medical-history/:id
// @desc    Update a medical record
// @access  Private (Patient only)
router.put('/:id', [
  body('type').optional().isIn(['condition', 'medication', 'allergy', 'surgery']),
  body('status').optional().isIn(['active', 'resolved', 'ongoing'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can update their medical records'
      });
    }

    const record = await MedicalRecord.findOne({
      _id: req.params.id,
      patientId: req.user._id
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    Object.assign(record, req.body);
    if (req.body.date) {
      record.date = new Date(req.body.date);
    }
    await record.save();

    res.json({
      success: true,
      data: record
    });
  } catch (error) {
    console.error('Update medical record error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/medical-history/:id
// @desc    Delete a medical record
// @access  Private (Patient only)
router.delete('/:id', async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can delete their medical records'
      });
    }

    const record = await MedicalRecord.findOneAndDelete({
      _id: req.params.id,
      patientId: req.user._id
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Medical record not found'
      });
    }

    res.json({
      success: true,
      message: 'Medical record deleted successfully'
    });
  } catch (error) {
    console.error('Delete medical record error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;

