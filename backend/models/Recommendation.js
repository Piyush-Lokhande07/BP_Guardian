import mongoose from 'mongoose';

const medicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  dosage: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    required: true
  },
  cost: {
    type: Number,
    required: true
  },
  availability: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'high'
  },
  sideEffects: [{
    type: String
  }]
});

const recommendationSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedDoctorIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  medications: [medicationSchema],
  lifestyleAdvice: [{
    type: String
  }],
  // Patient-selected subset of medications to request for approval
  patientSelectedMedications: [medicationSchema],
  selectedAt: {
    type: Date
  },
  // Patient-facing formatted message summarizing meds & costs
  patientMessage: {
    type: String,
    default: ''
  },
  reasoning: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'modified'],
    default: 'pending'
  },
  doctorNotes: {
    type: String,
    default: ''
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  // AI metadata
  aiModel: {
    type: String,
    default: 'gpt-4'
  },
  aiPrompt: {
    type: String
  },
  // Patient context at time of recommendation
  bpAverage: {
    systolic: Number,
    diastolic: Number
  },
  medicalHistorySummary: [{
    type: String
  }],
  allergies: [{
    type: String
  }]
}, {
  timestamps: true
});

// Index for efficient queries
recommendationSchema.index({ patientId: 1, status: 1, createdAt: -1 });
recommendationSchema.index({ status: 1, createdAt: -1 }); // For doctor dashboard
recommendationSchema.index({ assignedDoctorIds: 1, status: 1, createdAt: -1 });

const Recommendation = mongoose.model('Recommendation', recommendationSchema);

export default Recommendation;

