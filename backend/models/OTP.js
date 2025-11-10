import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for cleanup
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for email lookup
otpSchema.index({ email: 1, verified: 1 });

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;

