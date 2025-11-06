import React, { useState } from 'react'

export default function Profile() {
  const [active, setActive] = useState('patient')

  const TabButton = ({ id, label }) => (
    <button
      onClick={() => setActive(id)}
      className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
        active === id
          ? 'bg-emerald-600 text-white'
          : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  )

  const handleSubmit = (e) => {
    e.preventDefault()
  }

  const PatientForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-900">Patient Details</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-600">Name</label>
          <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="John Doe" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Age</label>
          <input type="number" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="28" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Gender</label>
          <select className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="" disabled>Select gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-600">Height (cm)</label>
          <input type="number" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="170" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Weight (kg)</label>
          <input type="number" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="65" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Blood Group</label>
          <select className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
            <option value="" disabled>Select blood group</option>
            <option>O+</option><option>O-</option>
            <option>A+</option><option>A-</option>
            <option>B+</option><option>B-</option>
            <option>AB+</option><option>AB-</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm text-slate-600">Medical History</label>
          <textarea rows="3" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Conditions, allergies, medications" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Phone Number</label>
          <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="9876543210" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm text-slate-600">Address</label>
          <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Street, City, State" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Pincode</label>
          <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="123456" />
        </div>
      </div>

      <div className="pt-2">
        <button type="submit" className="w-full sm:w-auto rounded-lg bg-emerald-600 px-5 py-2.5 text-white font-semibold hover:bg-emerald-700">
          Save
        </button>
      </div>
    </form>
  )

  const DoctorForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold text-slate-900">Doctor Details</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-600">Name</label>
          <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Dr. Jane Doe" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Education</label>
          <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="MBBS, MD" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Experience (years)</label>
          <input type="number" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="10" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Specialization</label>
          <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Cardiology" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Email</label>
          <input type="email" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="doctor@example.com" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Phone Number</label>
          <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="9876543210" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Registration Number</label>
          <input className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="REG-123456" />
        </div>
        <div>
          <label className="block text-sm text-slate-600">Password</label>
          <input type="password" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="••••••••" />
        </div>
      </div>

      <div className="pt-2">
        <button type="submit" className="w-full sm:w-auto rounded-lg bg-emerald-600 px-5 py-2.5 text-white font-semibold hover:bg-emerald-700">
          Save
        </button>
      </div>
    </form>
  )

  return (
    
    <main className="min-h-screen w-full bg-slate-50 px-4 py-10">
      <div className="w-full">


        {/* Card */}
        <div className="w-full bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 sm:p-8">
          {active === 'patient' ? <PatientForm /> : <DoctorForm />}
        </div>
      </div>
    </main>
  )
}