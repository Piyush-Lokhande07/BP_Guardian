import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['condition', 'medication', 'allergy', 'surgery'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'ongoing'],
    default: 'active'
  },
  // Additional fields for medications
  dosage: {
    type: String,
    default: ''
  },
  frequency: {
    type: String,
    default: ''
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
medicalRecordSchema.index({ patientId: 1, type: 1, status: 1 });

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);

export default MedicalRecord;

