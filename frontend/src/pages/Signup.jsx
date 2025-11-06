import React, { useState } from 'react';
import { User, Phone, Lock, Mail, FileText, Clipboard } from 'lucide-react';

export default function SignupPage() {
  const [activeTab, setActiveTab] = useState('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [patient, setPatient] = useState({
    fullName: '',
    email: '',
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

  const [doctor, setDoctor] = useState({
    doctorName: '',
    email: '',
    education: '',
    experience: '',
    specialization: '',
    phone: '',
    registrationNo: '',
    password: '',
    confirmPassword: ''
  });

  const handlePatientChange = (e) => {
    const { name, value } = e.target;
    setPatient((p) => ({ ...p, [name]: value }));
  };

  const handleDoctorChange = (e) => {
    const { name, value } = e.target;
    setDoctor((d) => ({ ...d, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    const formData = activeTab === 'patient' ? patient : doctor;
    
    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Remove confirmPassword from payload
      const { confirmPassword, ...payload } = formData;
      
      // Add role to payload
      payload.role = activeTab;

        // Transform field names for patient
        if (activeTab === 'patient') {
          payload.name = payload.fullName;
          delete payload.fullName;
        }

        // Convert numeric strings to numbers
        if (activeTab === 'patient') {
          payload.age = Number(payload.age);
          payload.height = Number(payload.height);
          payload.weight = Number(payload.weight);
        } else {
          payload.experience = Number(payload.experience);
        }

      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle validation errors
        if (data.errors) {
          const errorMessages = data.errors.map(err => err.msg).join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(data.message || 'Registration failed');
      }

      if (!data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      // Store auth token
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('authRole', data.data.role);
      
      setSuccess(true);

      // Navigate using react-router
      setTimeout(() => {
        window.location.href = activeTab === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard';
      }, 1000);
    } catch (err) {
      setError(err.message || 'Registration error. Please try again.');
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
          <h1 className="text-3xl font-bold text-gray-900">MediBridge</h1>
          <p className="text-gray-600 text-sm mt-2">Blood Pressure Monitoring & Doctor Supervision</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {['patient', 'doctor'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setError('');
                  setSuccess(false);
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
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <Clipboard className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {activeTab === 'patient' ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                      <div className="relative">
                        <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                        <input name="fullName" value={patient.fullName} onChange={handlePatientChange} required placeholder="John Doe" className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                        <input name="email" type="email" value={patient.email} onChange={handlePatientChange} required placeholder="you@example.com" className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
                        <input name="password" type="password" value={patient.password} onChange={handlePatientChange} required placeholder="••••••••" className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                      <input name="confirmPassword" type="password" value={patient.confirmPassword} onChange={handlePatientChange} required placeholder="••••••••" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>

                  <button type="submit" disabled={loading || success} className="w-full py-3 px-4 bg-linear-to-r from-blue-500 to-teal-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2">
                    {loading ? 'Creating account...' : 'Create Account'}
                  </button>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                        <input name="email" type="email" value={doctor.email} onChange={handleDoctorChange} required placeholder="doc@example.com" className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
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
                        <input name="password" type="password" value={doctor.password} onChange={handleDoctorChange} required placeholder="••••••••" className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                      <input name="confirmPassword" type="password" value={doctor.confirmPassword} onChange={handleDoctorChange} required placeholder="••••••••" className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
                <a href="/login" className="text-blue-600 font-semibold hover:text-blue-700">Sign in</a>
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
