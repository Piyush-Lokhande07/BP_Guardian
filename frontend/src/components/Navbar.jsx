/* eslint-disable no-unused-vars */
import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Menu, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { token, user } = useAuth()
  const location = useLocation()

  const isInPanel = location.pathname.startsWith('/patient/') || location.pathname.startsWith('/doctor/')
  const userName = user?.fullName || user?.doctorName || user?.email || 'User'

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={token ? (location.pathname.startsWith('/doctor/') ? '/doctor/dashboard' : '/patient/dashboard') : '/'}>
            <motion.div className="flex items-center gap-2" whileHover={{ scale: 1.05 }}>
              <div className="w-8 h-8 bg-linear-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900">BP Guardian</span>
            </motion.div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {isInPanel && token ? (
              <span className="text-slate-700 font-medium">Welcome, <span className="text-blue-600">{userName}</span></span>
            ) : null}
          </div>

          {/* Desktop Get Started */}
          {!token && (
            <Link to="/signup">
              <motion.button
                className="hidden md:flex px-6 py-2 bg-linear-to-r from-blue-500 to-teal-500 text-white rounded-full font-medium text-sm hover:shadow-lg transition-shadow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen((v) => !v)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div className="md:hidden pb-4 border-t border-slate-100" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {isInPanel && token ? (
              <div className="py-2 text-slate-700 font-medium">Welcome, <span className="text-blue-600">{userName}</span></div>
            ) : !token ? (
              <div className="px-4 py-3">
                <Link to="/signup" className="block w-full">
                  <button className="w-full px-6 py-2 bg-linear-to-r from-blue-500 to-teal-500 text-white rounded-full font-medium text-sm">Get Started</button>
                </Link>
              </div>
            ) : null}
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}
