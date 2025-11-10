import express from 'express';
import { body, validationResult } from 'express-validator';
import { protect } from '../middleware/auth.js';
import BPReading from '../models/BPReading.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Helper function to determine time slot based on current time
const getTimeSlot = (date = new Date()) => {
  const hour = date.getHours();
  if (hour >= 6 && hour < 10) return 'morning';
  if (hour >= 10 && hour < 14) return 'late-morning';
  if (hour >= 14 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 21) return 'evening';
  if (hour >= 21 || hour < 6) return 'night';
  return null;
};

// Helper function to get start and end of day
const getDayBounds = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// @route   POST /api/bp-readings
// @desc    Create a new BP reading
// @access  Private (Patient only)
router.post('/', [
  body('systolic').isInt({ min: 50, max: 300 }),
  body('diastolic').isInt({ min: 30, max: 200 }),
  body('heartRate').isInt({ min: 30, max: 250 }),
  body('source').optional().isIn(['manual', 'iot']),
  body('timeSlot').optional().isIn(['morning', 'late-morning', 'afternoon', 'evening', 'night'])
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

    const { systolic, diastolic, heartRate, source, notes, timeSlot: providedTimeSlot } = req.body;
    const now = new Date();
    
    // Determine time slot (use provided or auto-detect)
    const timeSlot = providedTimeSlot || getTimeSlot(now);
    
    // Check if patient has already entered 5 readings today
    const { start, end } = getDayBounds(now);
    const todayReadings = await BPReading.find({
      patientId: req.user._id,
      timestamp: { $gte: start, $lte: end }
    });

    if (todayReadings.length >= 5) {
      return res.status(400).json({
        success: false,
        message: 'You have already entered all 5 readings for today. Please try again tomorrow.',
        todayCount: todayReadings.length
      });
    }

    // Check if this time slot is already filled (optional - allow multiple entries per slot if needed)
    // We'll allow multiple entries per slot but enforce total 5 per day

    const reading = await BPReading.create({
      patientId: req.user._id,
      systolic,
      diastolic,
      heartRate,
      source: source || 'manual',
      notes: notes || '',
      timeSlot: timeSlot,
      timestamp: now
    });

    // Get updated count for today
    const updatedTodayReadings = await BPReading.find({
      patientId: req.user._id,
      timestamp: { $gte: start, $lte: end }
    });

    res.status(201).json({
      success: true,
      data: reading,
      todayCount: updatedTodayReadings.length,
      remainingSlots: 5 - updatedTodayReadings.length,
      isComplete: updatedTodayReadings.length >= 5
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

// @route   GET /api/bp-readings/daily-progress
// @desc    Get today's BP reading progress (time slots and completion status)
// @access  Private (Patient only)
// NOTE: This route must be defined BEFORE /:id to avoid route conflicts
router.get('/daily-progress', async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can view daily progress'
      });
    }

    const now = new Date();
    const { start, end } = getDayBounds(now);
    
    const todayReadings = await BPReading.find({
      patientId: req.user._id,
      timestamp: { $gte: start, $lte: end }
    }).sort({ timestamp: -1 });

    // Define time slots
    const timeSlots = [
      { id: 'morning', label: 'Morning', timeRange: '6-7 AM', completed: false },
      { id: 'late-morning', label: 'Late Morning', timeRange: '10-11 AM', completed: false },
      { id: 'afternoon', label: 'Afternoon', timeRange: '2-3 PM', completed: false },
      { id: 'evening', label: 'Evening', timeRange: '6-7 PM', completed: false },
      { id: 'night', label: 'Night', timeRange: '9-10 PM', completed: false }
    ];

    // Mark completed slots
    const completedSlots = new Set(todayReadings.map(r => r.timeSlot).filter(Boolean));
    timeSlots.forEach(slot => {
      slot.completed = completedSlots.has(slot.id);
      if (slot.completed) {
        const reading = todayReadings.find(r => r.timeSlot === slot.id);
        slot.reading = reading ? {
          systolic: reading.systolic,
          diastolic: reading.diastolic,
          heartRate: reading.heartRate,
          timestamp: reading.timestamp
        } : null;
      }
    });

    // Calculate today's average if readings exist
    let avgSystolic = 0;
    let avgDiastolic = 0;
    if (todayReadings.length > 0) {
      avgSystolic = Math.round(todayReadings.reduce((sum, r) => sum + r.systolic, 0) / todayReadings.length);
      avgDiastolic = Math.round(todayReadings.reduce((sum, r) => sum + r.diastolic, 0) / todayReadings.length);
    }

    res.json({
      success: true,
      data: {
        date: now.toISOString().split('T')[0],
        timeSlots,
        totalReadings: todayReadings.length,
        remainingSlots: 5 - todayReadings.length,
        isComplete: todayReadings.length >= 5,
        avgSystolic,
        avgDiastolic,
        readings: todayReadings
      }
    });
  } catch (error) {
    console.error('Get daily progress error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/bp-readings/trend
// @desc    Get last 30 days BP trend and classification
// @access  Private (Patient) or (Doctor with patientId)
// NOTE: This route must be defined BEFORE /:id to avoid route conflicts
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

export default router;

