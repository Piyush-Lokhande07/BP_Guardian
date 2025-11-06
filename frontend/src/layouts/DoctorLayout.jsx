import React from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { LayoutDashboard, UserCheck, Users, ClipboardCheck } from 'lucide-react'

export default function DoctorLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          <aside className="bg-white rounded-xl border border-slate-200 p-4 h-max sticky top-24">
            <nav className="space-y-1">
              <NavLink to="/doctor/dashboard" className={({isActive}) => `flex items-center gap-2 px-3 py-2 rounded-lg ${isActive? 'bg-blue-50 text-blue-600':'text-slate-700 hover:bg-slate-50'}`}>
                <LayoutDashboard className="w-4 h-4"/> Dashboard
              </NavLink>
              <NavLink to="/doctor/patient-requests" className={({isActive}) => `flex items-center gap-2 px-3 py-2 rounded-lg ${isActive? 'bg-blue-50 text-blue-600':'text-slate-700 hover:bg-slate-50'}`}>
                <UserCheck className="w-4 h-4"/> Patient Requests
              </NavLink>
              <NavLink to="/doctor/patients" className={({isActive}) => `flex items-center gap-2 px-3 py-2 rounded-lg ${isActive? 'bg-blue-50 text-blue-600':'text-slate-700 hover:bg-slate-50'}`}>
                <Users className="w-4 h-4"/> Assigned Patients
              </NavLink>
              <NavLink to="/doctor/review-advice" className={({isActive}) => `flex items-center gap-2 px-3 py-2 rounded-lg ${isActive? 'bg-blue-50 text-blue-600':'text-slate-700 hover:bg-slate-50'}`}>
                <ClipboardCheck className="w-4 h-4"/> Review Advice
              </NavLink>
            </nav>
          </aside>
          <main>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
