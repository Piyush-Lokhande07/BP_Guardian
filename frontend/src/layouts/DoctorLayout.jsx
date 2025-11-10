import React from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, UserCheck, Users, ClipboardCheck, LogOut } from 'lucide-react'

export default function DoctorLayout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

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
              <div className="pt-4 mt-4 border-t border-slate-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4"/> Logout
                </button>
              </div>
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
