import mongoose from 'mongoose';

const doctorLinkSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['requested', 'approved', 'declined'],
    default: 'requested'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: {
    type: Date
  },
  comment: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

doctorLinkSchema.index({ doctorId: 1, status: 1, requestedAt: -1 });
doctorLinkSchema.index({ patientId: 1, doctorId: 1 }, { unique: true });

const DoctorLink = mongoose.model('DoctorLink', doctorLinkSchema);

export default DoctorLink;


