import mongoose from 'mongoose';

const bpReadingSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  systolic: {
    type: Number,
    required: true,
    min: 50,
    max: 300
  },
  diastolic: {
    type: Number,
    required: true,
    min: 30,
    max: 200
  },
  heartRate: {
    type: Number,
    required: true,
    min: 30,
    max: 250
  },
  source: {
    type: String,
    enum: ['manual', 'iot'],
    default: 'manual'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  timeSlot: {
    type: String,
    enum: ['morning', 'late-morning', 'afternoon', 'evening', 'night'],
    default: null
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for efficient queries
bpReadingSchema.index({ patientId: 1, timestamp: -1 });
bpReadingSchema.index({ patientId: 1, timestamp: 1, timeSlot: 1 });

// Virtual for BP status
bpReadingSchema.virtual('status').get(function() {
  const sys = this.systolic;
  const dia = this.diastolic;
  
  if (sys < 120 && dia < 80) {
    return { label: 'Normal', color: 'green' };
  } else if (sys < 130 && dia < 80) {
    return { label: 'Elevated', color: 'yellow' };
  } else if (sys < 140 || dia < 90) {
    return { label: 'High BP Stage 1', color: 'orange' };
  } else {
    return { label: 'High BP Stage 2', color: 'red' };
  }
});

bpReadingSchema.set('toJSON', { virtuals: true });

const BPReading = mongoose.model('BPReading', bpReadingSchema);

export default BPReading;

