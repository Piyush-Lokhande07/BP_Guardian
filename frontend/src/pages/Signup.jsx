import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, Lock, Mail, FileText, Clipboard, Stethoscope, CheckCircle, Loader2, AlertCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { api, API_BASE_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function SignupPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const [patient, setPatient] = useState({
    email: '',
    fullName: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    bloodGroup: '',
    medicalHistory: '',
    phone: '',
    address: '',
    pincode: '',
    password: '',
    confirmPassword: ''
  });

  // Fetch doctors when patient tab is active
  useEffect(() => {
    if (activeTab === 'patient') {
      fetchDoctors();
    }
  }, [activeTab]);

  const fetchDoctors = async () => {
    try {
      setLoadingDoctors(true);
      // Use axios directly since this is public endpoint (no auth token needed)
  const response = await axios.get(`${API_BASE_URL}/users/doctors`);
      if (response.data.success) {
        setDoctors(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching doctors:', err);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const toggleDoctorSelection = (doctorId) => {
    const id = doctorId.toString();
    if (selectedDoctors.includes(id)) {
      setSelectedDoctors(selectedDoctors.filter(d => d !== id));
    } else {
      if (selectedDoctors.length < 4) {
        setSelectedDoctors([...selectedDoctors, id]);
      } else {
        setError('You can select up to 4 doctors');
      }
    }
  };

  // Validate doctor selection before submit
  const validateDoctorSelection = () => {
    if (activeTab === 'patient') {
      if (selectedDoctors.length === 0) {
        setError('Please select at least 1 doctor (maximum 4)');
        return false;
      }
      if (selectedDoctors.length > 4) {
        setError('You can select maximum 4 doctors');
        return false;
      }
    }
    return true;
  };

  const [doctor, setDoctor] = useState({
    email: '',
    doctorName: '',
    education: '',
    experience: '',
    specialization: '',
    phone: '',
    registrationNo: '',
    password: '',
    confirmPassword: ''
  });

  // Password visibility toggles for signup fields
  const [showPatientPassword, setShowPatientPassword] = useState(false);
  const [showPatientConfirm, setShowPatientConfirm] = useState(false);
  const [showDoctorPassword, setShowDoctorPassword] = useState(false);
  const [showDoctorConfirm, setShowDoctorConfirm] = useState(false);

  const handlePatientChange = (e) => {
    const { name, value } = e.target;
    setPatient((p) => ({ ...p, [name]: value }));
  };

  const handleDoctorChange = (e) => {
    const { name, value } = e.target;
    setDoctor((d) => ({ ...d, [name]: value }));
  };

  const handleSendOTP = async () => {
    const email = activeTab === 'patient' ? patient.email : doctor.email;
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    setSendingOtp(true);
    setError('');
    try {
  const response = await api.post('/api/auth/send-otp', { email });
      if (response.data.success) {
        setOtpSent(true);
        setSuccess('OTP sent to your email! Please check your inbox.');
        // In development, show OTP in console if provided
        if (response.data.otp) {
          console.log('OTP (development only):', response.data.otp);
        }
      } else {
        throw new Error(response.data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    const email = activeTab === 'patient' ? patient.email : doctor.email;
    setSendingOtp(true);
    setError('');
    try {
  const response = await api.post('/api/auth/verify-otp', { email, otp });
      if (response.data.success) {
        setOtpVerified(true);
        setSuccess('Email verified successfully! You can now complete your registration.');
      } else {
        throw new Error(response.data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // Let backend handle all validation - just prepare the payload

      // Prepare payload based on role
      let payload;
      if (activeTab === 'patient') {
        // Calculate date of birth from age (approximate)
        let dateOfBirth = undefined;
        if (patient.age) {
          const today = new Date();
          const birthYear = today.getFullYear() - parseInt(patient.age);
          dateOfBirth = new Date(birthYear, 0, 1); // Use January 1st as approximate
        }

        payload = {
          role: 'patient',
          email: patient.email,
          password: patient.password,
          fullName: patient.fullName,
          dateOfBirth: dateOfBirth,
          gender: patient.gender || undefined,
          height: patient.height ? patient.height.toString() : undefined,
          weight: patient.weight ? patient.weight.toString() : undefined,
          bloodGroup: patient.bloodGroup || undefined,
          phone: patient.phone || undefined,
          address: patient.address || undefined,
          zipcode: patient.pincode || undefined,
          medicalHistoryText: patient.medicalHistory || undefined,
          doctorIds: selectedDoctors.length > 0 ? selectedDoctors : undefined,
          otp: otp,
        };
      } else {
        payload = {
          role: 'doctor',
          email: doctor.email,
          password: doctor.password,
          doctorName: doctor.doctorName,
          education: doctor.education || undefined,
          experienceYears: doctor.experience ? parseInt(doctor.experience) : undefined,
          specialization: doctor.specialization || undefined,
          phone: doctor.phone || undefined,
          registrationNumber: doctor.registrationNo || undefined,
          otp: otp,
        };
      }

      // Call backend API
  const response = await api.post('/api/auth/register', payload);

      if (response.data.success && response.data.data) {
        const { token, role, email: userEmail } = response.data.data;
        
        // Store via auth context
        await login({ 
          token, 
          role, 
          profile: { 
            email: userEmail
          } 
        });
        
        setSuccess(true);
        setTimeout(() => {
          const redirectUrl = role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard';
          navigate(redirectUrl);
        }, 1000);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      // Show clear error message from backend or client-side validation
      const errorMessage = err.response?.data?.message || err.message || 'Signup failed. Please check all fields and try again.';
      setError(errorMessage);
      console.error('Signup error:', err);
      
      // Scroll to error message
      setTimeout(() => {
        const errorElement = document.getElementById('signup-error');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-linear-to-br from-blue-500 to-teal-500 rounded-2xl mb-4">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-transparent">M</div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">BP Guardian</h1>
          <p className="text-gray-600 text-sm mt-2">Blood Pressure Monitoring & Doctor Supervision</p>
        </div>

        <div className="mb-4">
          <Link to="/" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" /> Home
          </Link>
        </div>
MediBridge
        <div className="bg-white rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {['patient', 'doctor'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setError('');
                  setSuccess(false);
                  // Don't reset OTP verification when switching tabs - allow user to verify once and switch
                  // Only reset OTP input fields
                  if (tab !== activeTab) {
                    setOtpSent(false);
                    setOtp('');
                  }
                }}
                className={`flex-1 py-4 px-4 font-medium text-sm transition-all duration-200 relative ${
                  activeTab === tab ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'patient' ? 'Patient Sign Up' : 'Doctor Sign Up'}
                {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-blue-500 to-teal-500" />}
              </button>
            ))}
          </div>

          <div className="p-8">
            {success && (
              <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-lg">
                <p className="text-teal-800 text-sm font-medium">✓ Account created. Redirecting...</p>
              </div>
            )}

            {error && (
              <div id="signup-error" className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg flex gap-3 animate-pulse">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-red-800 text-sm font-semibold mb-1">Registration Error:</p>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {activeTab === 'patient' ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                          <input 
                            name="email" 
                            type="email" 
                            value={patient.email} 
                            onChange={handlePatientChange} 
                            required 
                            placeholder="john@example.com" 
                            disabled={otpVerified}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed" 
                          />
                        </div>
                        {!otpVerified && (
                          <button
                            type="button"
                            onClick={handleSendOTP}
                            disabled={sendingOtp || !patient.email || otpSent}
                            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                          >
                            {sendingOtp ? <Loader2 className="w-5 h-5 animate-spin" /> : otpSent ? 'Resend OTP' : 'Send OTP'}
                          </button>
                        )}
                        {otpVerified && (
                          <div className="flex items-center px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                        )}
                      </div>
                      {otpSent && !otpVerified && (
                        <div className="mt-3 space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="000000"
                              maxLength={6}
                              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
                            />
                            <button
                              type="button"
                              onClick={handleVerifyOTP}
                              disabled={sendingOtp || otp.length !== 6}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {sendingOtp ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
                            </button>
                          </div>
                          <p className="text-xs text-gray-500">Check your email for the 6-digit OTP code</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                        <input name="fullName" value={patient.fullName} onChange={handlePatientChange} required placeholder="John Doe" className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                      <input name="age" type="number" value={patient.age} onChange={handlePatientChange} required placeholder="28" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                      <select name="gender" value={patient.gender} onChange={handlePatientChange} required className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="" disabled>Select gender</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                      <select name="bloodGroup" value={patient.bloodGroup} onChange={handlePatientChange} required className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="" disabled>Select blood group</option>
                        <option>O+</option>
                        <option>O-</option>
                        <option>A+</option>
                        <option>A-</option>
                        <option>B+</option>
                        <option>B-</option>
                        <option>AB+</option>
                        <option>AB-</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Height (cm)</label>
                      <input name="height" type="number" value={patient.height} onChange={handlePatientChange} placeholder="170" required className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Weight (kg)</label>
                      <input name="weight" type="number" value={patient.weight} onChange={handlePatientChange} placeholder="65" required className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Medical History</label>
                      <textarea name="medicalHistory" value={patient.medicalHistory} onChange={handlePatientChange} rows="3" placeholder="Any known conditions, allergies, medications" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                        <input name="phone" value={patient.phone} onChange={handlePatientChange} required placeholder="9876543210" className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                      <input name="address" value={patient.address} onChange={handlePatientChange} required placeholder="Street, City, State" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                      <input name="pincode" value={patient.pincode} onChange={handlePatientChange} required placeholder="123456" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                        <input name="password" type={showPatientPassword ? 'text' : 'password'} value={patient.password} onChange={handlePatientChange} required placeholder="••••••••" className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <button type="button" onClick={() => setShowPatientPassword(s => !s)} className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700" aria-label={showPatientPassword ? 'Hide password' : 'Show password'}>
                          {showPatientPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                      <div className="relative">
                        <input name="confirmPassword" type={showPatientConfirm ? 'text' : 'password'} value={patient.confirmPassword} onChange={handlePatientChange} required placeholder="••••••••" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <button type="button" onClick={() => setShowPatientConfirm(s => !s)} className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700" aria-label={showPatientConfirm ? 'Hide password' : 'Show password'}>
                          {showPatientConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Selection */}
                  <div className="sm:col-span-2 mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Select Doctors (Required - minimum 1, maximum 4)
                      <span className="text-xs text-gray-500 ml-2">Requests will be sent to selected doctors</span>
                    </label>
                    {loadingDoctors ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        <span className="ml-2 text-sm text-gray-600">Loading doctors...</span>
                      </div>
                    ) : doctors.length === 0 ? (
                      <p className="text-sm text-gray-500 py-4 text-center">No doctors available yet</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                        {doctors.map((doctor) => {
                          const isSelected = selectedDoctors.includes(doctor._id.toString());
                          return (
                            <div
                              key={doctor._id}
                              onClick={() => toggleDoctorSelection(doctor._id)}
                              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                                  isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                }`}>
                                  {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-sm text-gray-900">
                                    {doctor.doctorName || 'Dr. ' + doctor.email}
                                  </div>
                                  {doctor.specialization && (
                                    <div className="text-xs text-gray-600 mt-1">{doctor.specialization}</div>
                                  )}
                                  {doctor.education && (
                                    <div className="text-xs text-gray-500 mt-0.5">{doctor.education}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    <p className={`text-xs mt-2 ${selectedDoctors.length === 0 ? 'text-red-600' : selectedDoctors.length < 4 ? 'text-blue-600' : 'text-gray-600'}`}>
                      {selectedDoctors.length === 0 
                        ? '⚠️ Please select at least 1 doctor (required)'
                        : `${selectedDoctors.length} doctor${selectedDoctors.length > 1 ? 's' : ''} selected. ${selectedDoctors.length < 4 ? `You can select up to ${4 - selectedDoctors.length} more.` : 'Maximum reached.'}`
                      }
                    </p>
                  </div>

                  <button type="submit" disabled={loading || success} className="w-full py-3 px-4 bg-linear-to-r from-blue-500 to-teal-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                    {loading ? 'Creating account...' : 'Create Account'}
                  </button>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                          <input 
                            name="email" 
                            type="email" 
                            value={doctor.email} 
                            onChange={handleDoctorChange} 
                            required 
                            placeholder="doc@example.com" 
                            disabled={otpVerified}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed" 
                          />
                        </div>
                        {!otpVerified && (
                          <button
                            type="button"
                            onClick={handleSendOTP}
                            disabled={sendingOtp || !doctor.email || otpSent}
                            className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                          >
                            {sendingOtp ? <Loader2 className="w-5 h-5 animate-spin" /> : otpSent ? 'Resend OTP' : 'Send OTP'}
                          </button>
                        )}
                        {otpVerified && (
                          <div className="flex items-center px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          </div>
                        )}
                      </div>
                      {otpSent && !otpVerified && (
                        <div className="mt-3 space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Enter OTP</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={otp}
                              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="000000"
                              maxLength={6}
                              className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
                            />
                            <button
                              type="button"
                              onClick={handleVerifyOTP}
                              disabled={sendingOtp || otp.length !== 6}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {sendingOtp ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
                            </button>
                          </div>
                          <p className="text-xs text-gray-500">Check your email for the 6-digit OTP code</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Doctor Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                        <input name="doctorName" value={doctor.doctorName} onChange={handleDoctorChange} required placeholder="Dr. Jane Doe" className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Education</label>
                      <input name="education" value={doctor.education} onChange={handleDoctorChange} placeholder="MBBS, MD" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Experience (years)</label>
                      <input name="experience" type="number" value={doctor.experience} onChange={handleDoctorChange} placeholder="5" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Specialization</label>
                      <input name="specialization" value={doctor.specialization} onChange={handleDoctorChange} placeholder="Cardiology" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                        <input name="phone" value={doctor.phone} onChange={handleDoctorChange} required placeholder="9876543210" className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Registration No.</label>
                      <input name="registrationNo" value={doctor.registrationNo} onChange={handleDoctorChange} placeholder="REG-12345" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                        <input name="password" type={showDoctorPassword ? 'text' : 'password'} value={doctor.password} onChange={handleDoctorChange} required placeholder="••••••••" className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <button type="button" onClick={() => setShowDoctorPassword(s => !s)} className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700" aria-label={showDoctorPassword ? 'Hide password' : 'Show password'}>
                          {showDoctorPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                      <div className="relative">
                        <input name="confirmPassword" type={showDoctorConfirm ? 'text' : 'password'} value={doctor.confirmPassword} onChange={handleDoctorChange} required placeholder="••••••••" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        <button type="button" onClick={() => setShowDoctorConfirm(s => !s)} className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700" aria-label={showDoctorConfirm ? 'Hide password' : 'Show password'}>
                          {showDoctorConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <button type="submit" disabled={loading || success} className="w-full py-3 px-4 bg-linear-to-r from-blue-500 to-teal-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                    {loading ? 'Creating account...' : 'Create Account'}
                  </button>
                </>
              )}
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700">Sign in</Link>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-8">
          By creating an account,  you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
