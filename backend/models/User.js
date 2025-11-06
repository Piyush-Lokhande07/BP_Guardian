import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['patient', 'doctor'],
    required: true
  },
  // Patient-specific fields
  fullName: {
    type: String,
    default: ''
  },
  dateOfBirth: {
    type: Date
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other', '']
  },
  phone: {
    type: String,
    default: ''
  },
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
    default: ''
  },
  medicalHistoryText: {
    type: String,
    default: ''
  },
  // Location & Economic Info
  address: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: ''
  },
  state: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  zipcode: {
    type: String,
    default: ''
  },
  incomeRange: {
    type: String,
    default: ''
  },
  healthInsurance: {
    type: String,
    default: ''
  },
  // Health Info
  height: {
    type: String,
    default: ''
  },
  weight: {
    type: String,
    default: ''
  },
  bmi: {
    type: String,
    default: ''
  },
  // Emergency Contact
  emergencyContact: {
    name: { type: String, default: '' },
    relationship: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' }
  },
  // Doctor-specific fields
  doctorName: {
    type: String,
    default: ''
  },
  specialization: {
    type: String,
    default: ''
  },
  education: {
    type: String,
    default: ''
  },
  experienceYears: {
    type: Number,
    default: 0
  },
  licenseNumber: {
    type: String,
    default: ''
  },
  registrationNumber: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Calculate age for patients
userSchema.virtual('age').get(function() {
  if (this.dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
  return null;
});

userSchema.set('toJSON', { virtuals: true });

const User = mongoose.model('User', userSchema);

export default User;

