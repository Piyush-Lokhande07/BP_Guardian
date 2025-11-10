/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('authToken') || '')
  const [role, setRole] = useState(() => localStorage.getItem('authRole') || '')
  const [user, setUser] = useState(null)

  useEffect(() => {
    if (token) localStorage.setItem('authToken', token)
    else localStorage.removeItem('authToken')
  }, [token])

  useEffect(() => {
    if (role) localStorage.setItem('authRole', role)
    else localStorage.removeItem('authRole')
  }, [role])

  // Fetch user profile when token is available but user is not set
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (token && !user) {
        try {
          const api = (await import('../services/api')).api
          const response = await api.get('/users/me')
          if (response.data.success) {
            setUser(response.data.data)
          }
        } catch (err) {
          console.error('Error fetching user profile:', err)
        }
      }
    }
    fetchUserProfile()
  }, [token, user])

  const login = async ({ token: t, role: r, profile }) => {
    setToken(t)
    setRole(r)
    setUser(profile || null)
  }

  const logout = () => {
    setToken('')
    setRole('')
    setUser(null)
  }

  const value = useMemo(() => ({ token, role, user, login, logout }), [token, role, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function ProtectedRoute({ roles, children }) {
  const { token, role } = useAuth()
  const location = useLocation()

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (roles && roles.length > 0 && !roles.includes(role)) {
    // Redirect to appropriate dashboard if wrong role
    return <Navigate to={role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard'} replace />
  }

  return children
}
