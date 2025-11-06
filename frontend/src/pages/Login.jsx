import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate, Navigate, Link } from 'react-router-dom';

export default function LoginPage() {
  const { login, token, role } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Call backend login API (backend runs on localhost:5000)
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // backend expects email and password
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      // Check for server-side validation or auth failure
      if (!response.ok || !result.success) {
        const message = (result && result.message) || 'Invalid credentials';
        throw new Error(message);
      }

      // If already authenticated, redirect away from login page
      if (token) {
        const redirectUrl = role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'
        return <Navigate to={redirectUrl} replace />
      }

      const data = result.data;

      // Store via auth context using server-provided token and role/profile
      await login({
        token: data.token,
        role: data.role || activeTab,
        profile: { email: data.email, fullName: data.fullName, id: data.id },
      });

      setSuccess(true);

      // Redirect based on the role returned from server (fallback to activeTab)
      setTimeout(() => {
        const redirectUrl =
          (data.role || activeTab) === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard';
        navigate(redirectUrl, { replace: true });
      }, 800);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Removed unused animation variants to avoid lint warnings

  return (
  <>
    <Navbar />
  <div className="min-h-screen pt-20 bg-linear-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 bg-linear-to-br from-blue-500 to-teal-500 rounded-2xl mb-4">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-transparent">
              M
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">BP Guardian</h1>
          <p className="text-gray-600 text-sm mt-2">Healthcare AI Platform</p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {['patient', 'doctor'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setError('');
                  setEmail('');
                  setPassword('');
                }}
                className={`flex-1 py-4 px-4 font-medium text-sm transition-all duration-200 relative ${
                  activeTab === tab
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'patient' ? 'Patient Login' : 'Doctor Login'}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-blue-500 to-teal-500" />
                )}
              </button>
            ))}
          </div>

          {/* Form Container */}
          <div className="p-8">
            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-lg">
                <p className="text-teal-800 text-sm font-medium">
                  ✓ Login successful! Redirecting...
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading || success}
                className="w-full py-3 px-4 bg-linear-to-r from-blue-500 to-teal-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Login'
                )}
              </button>

              {/* Security Message */}
              <p className="text-center text-xs text-gray-600">
                Secure login powered by BP Guardian AI
              </p>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link to="/signup" className="text-blue-600 font-semibold hover:text-blue-700">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-xs text-gray-500 mt-8">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  </>
  );
}