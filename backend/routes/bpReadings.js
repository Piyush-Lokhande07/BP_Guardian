import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import BPReading from '../models/BPReading.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   POST /api/bp-readings
// @desc    Create a new BP reading
// @access  Private (Patient only)
router.post('/', [
  body('systolic').isInt({ min: 50, max: 300 }),
  body('diastolic').isInt({ min: 30, max: 200 }),
  body('heartRate').isInt({ min: 30, max: 250 }),
  body('source').optional().isIn(['manual', 'iot'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Only patients can create their own readings
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can create BP readings'
      });
    }

    const { systolic, diastolic, heartRate, source, notes } = req.body;

    const reading = await BPReading.create({
      patientId: req.user._id,
      systolic,
      diastolic,
      heartRate,
      source: source || 'manual',
      notes: notes || '',
      timestamp: new Date()
    });

    res.status(201).json({
      success: true,
      data: reading
    });
  } catch (error) {
    console.error('Create BP reading error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/bp-readings
// @desc    Get all BP readings for current patient
// @access  Private (Patient) or (Doctor viewing patient data)
router.get('/', async (req, res) => {
  try {
    let query = {};
    
    // Patients can only see their own readings
    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    } else if (req.user.role === 'doctor' && req.query.patientId) {
      // Doctors can view specific patient's readings
      query.patientId = req.query.patientId;
    } else if (req.user.role === 'doctor') {
      return res.status(400).json({
        success: false,
        message: 'Doctor must specify patientId to view readings'
      });
    }

    // Optional filters
    if (req.query.startDate) {
      query.timestamp = { ...query.timestamp, $gte: new Date(req.query.startDate) };
    }
    if (req.query.endDate) {
      query.timestamp = { ...query.timestamp, $lte: new Date(req.query.endDate) };
    }
    if (req.query.limit) {
      query.limit = parseInt(req.query.limit);
    }

    const readings = await BPReading.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(req.query.limit) || 100);

    // Calculate statistics
    const avgSystolic = readings.length > 0
      ? Math.round(readings.reduce((sum, r) => sum + r.systolic, 0) / readings.length)
      : 0;
    const avgDiastolic = readings.length > 0
      ? Math.round(readings.reduce((sum, r) => sum + r.diastolic, 0) / readings.length)
      : 0;

    res.json({
      success: true,
      data: readings,
      stats: {
        count: readings.length,
        avgSystolic,
        avgDiastolic,
        latest: readings[0] || null
      }
    });
  } catch (error) {
    console.error('Get BP readings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/bp-readings/:id
// @desc    Get a single BP reading
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    let query = { _id: req.params.id };
    
    if (req.user.role === 'patient') {
      query.patientId = req.user._id;
    }

    const reading = await BPReading.findOne(query);

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: 'BP reading not found'
      });
    }

    res.json({
      success: true,
      data: reading
    });
  } catch (error) {
    console.error('Get BP reading error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/bp-readings/:id
// @desc    Update a BP reading
// @access  Private (Patient only)
router.put('/:id', [
  body('systolic').optional().isInt({ min: 50, max: 300 }),
  body('diastolic').optional().isInt({ min: 30, max: 200 }),
  body('heartRate').optional().isInt({ min: 30, max: 250 })
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
        message: 'Only patients can update their BP readings'
      });
    }

    const reading = await BPReading.findOne({
      _id: req.params.id,
      patientId: req.user._id
    });

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: 'BP reading not found'
      });
    }

    Object.assign(reading, req.body);
    await reading.save();

    res.json({
      success: true,
      data: reading
    });
  } catch (error) {
    console.error('Update BP reading error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/bp-readings/:id
// @desc    Delete a BP reading
// @access  Private (Patient only)
router.delete('/:id', async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can delete their BP readings'
      });
    }

    const reading = await BPReading.findOneAndDelete({
      _id: req.params.id,
      patientId: req.user._id
    });

    if (!reading) {
      return res.status(404).json({
        success: false,
        message: 'BP reading not found'
      });
    }

    res.json({
      success: true,
      message: 'BP reading deleted successfully'
    });
  } catch (error) {
    console.error('Delete BP reading error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/bp-readings/trend
// @desc    Get last 30 days BP trend and classification
// @access  Private (Patient) or (Doctor with patientId)
router.get('/trend', async (req, res) => {
  try {
    let patientId;
    if (req.user.role === 'patient') {
      patientId = req.user._id;
    } else if (req.user.role === 'doctor' && req.query.patientId) {
      patientId = req.query.patientId;
    } else {
      return res.status(400).json({ success: false, message: 'Doctor must specify patientId' });
    }

    const since = new Date();
    since.setDate(since.getDate() - 30);

    const readings = await BPReading.find({ patientId, timestamp: { $gte: since } }).sort({ timestamp: 1 });

    const avgSystolic = readings.length ? Math.round(readings.reduce((s, r) => s + r.systolic, 0) / readings.length) : 0;
    const avgDiastolic = readings.length ? Math.round(readings.reduce((s, r) => s + r.diastolic, 0) / readings.length) : 0;

    let classification = 'Normal';
    if (avgSystolic < 120 && avgDiastolic < 80) classification = 'Normal';
    else if (avgSystolic < 130 && avgDiastolic < 80) classification = 'Elevated';
    else if (avgSystolic < 140 || avgDiastolic < 90) classification = 'High BP Stage 1';
    else classification = 'High BP Stage 2';

    res.json({
      success: true,
      data: {
        readings,
        avgSystolic,
        avgDiastolic,
        classification
      }
    });
  } catch (error) {
    console.error('Get BP trend error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;

