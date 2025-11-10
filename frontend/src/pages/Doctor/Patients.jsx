import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'
import Card from '../../components/Card'
import { Loader2, User, Mail, Phone, Eye } from 'lucide-react'

export default function Patients() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAssignedPatients()
  }, [])

  const fetchAssignedPatients = async () => {
    try {
      setLoading(true)
      const response = await api.get('/doctor-dashboard/assigned-patients')
      if (response.data.success) {
        setPatients(response.data.data || [])
      }
    } catch (err) {
      console.error('Error fetching assigned patients:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card title="Assigned Patients">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </Card>
    )
  }

  return (
    <Card title="Assigned Patients">
      {patients.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-slate-500">No assigned patients yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {patients.map((link) => {
            const patient = link.patientId && typeof link.patientId === 'object' 
              ? link.patientId 
              : null

            if (!patient) return null

            return (
              <div
                key={link._id}
                className="flex items-center justify-between border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-slate-900 mb-1">
                      {patient.fullName || 'Unknown Patient'}
                    </div>
                    <div className="text-sm text-slate-600 space-y-1">
                      {patient.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          {patient.email}
                        </div>
                      )}
                      {patient.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          {patient.phone}
                        </div>
                      )}
                      {patient.gender && (
                        <div className="text-xs text-slate-500">
                          Gender: {patient.gender} {patient.age && `• Age: ${patient.age}`}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <Link
                  to={`/doctor/patients/${patient._id}`}
                  className="ml-4 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
