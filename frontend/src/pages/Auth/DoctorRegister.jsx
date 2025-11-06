import React, { useState } from 'react'
import Navbar from '../../components/Navbar'
import Input from '../../components/Input'
import { Mail, Lock, User, Stethoscope } from 'lucide-react'

export default function DoctorRegister() {
  const [form, setForm] = useState({ name:'', email:'', password:'', license:'' })
  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-20 bg-slate-50 px-4">
        <div className="max-w-lg mx-auto bg-white border border-slate-200 rounded-xl p-6">
          <h1 className="text-2xl font-semibold mb-4">Doctor Registration</h1>
          <div className="grid gap-4">
            <Input label="Full Name" value={form.name} onChange={update('name')} left={<User className="w-4 h-4 text-slate-400"/>} />
            <Input label="Email" type="email" value={form.email} onChange={update('email')} left={<Mail className="w-4 h-4 text-slate-400"/>} />
            <Input label="Password" type="password" value={form.password} onChange={update('password')} left={<Lock className="w-4 h-4 text-slate-400"/>} />
            <Input label="Medical License No." value={form.license} onChange={update('license')} left={<Stethoscope className="w-4 h-4 text-slate-400"/>} />
            <button className="mt-2 py-3 rounded-lg bg-linear-to-r from-blue-500 to-teal-500 text-white font-semibold">Create Account</button>
          </div>
          <p className="mt-4 text-sm text-slate-600">Already have an account? <a href="/login" className="text-blue-600">Login</a></p>
        </div>
      </div>
    </>
  )
}
