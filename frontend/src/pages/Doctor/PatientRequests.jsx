import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import Card from '../../components/Card'
import { Loader2, CheckCircle, XCircle, User, Mail, Calendar } from 'lucide-react'

export default function PatientRequests() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState({})

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await api.get('/doctor-dashboard/requests')
      if (response.data.success) {
        setRequests(response.data.data || [])
      }
    } catch (err) {
      console.error('Error fetching requests:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (requestId) => {
    setProcessing({ ...processing, [requestId]: 'accepting' })
    try {
      const response = await api.put(`/doctor-dashboard/requests/${requestId}/accept`)
      if (response.data.success) {
        // Remove from list
        setRequests(requests.filter(r => r._id !== requestId))
      }
    } catch (err) {
      console.error('Error accepting request:', err)
      alert(err.response?.data?.message || 'Failed to accept request')
    } finally {
      setProcessing({ ...processing, [requestId]: null })
    }
  }

  const handleDecline = async (requestId) => {
    if (!confirm('Are you sure you want to decline this patient request?')) {
      return
    }

    setProcessing({ ...processing, [requestId]: 'declining' })
    try {
      const response = await api.put(`/doctor-dashboard/requests/${requestId}/decline`)
      if (response.data.success) {
        // Remove from list
        setRequests(requests.filter(r => r._id !== requestId))
      }
    } catch (err) {
      console.error('Error declining request:', err)
      alert(err.response?.data?.message || 'Failed to decline request')
    } finally {
      setProcessing({ ...processing, [requestId]: null })
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <Card title="Patient Link Requests">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </Card>
    )
  }

  return (
    <Card title="Patient Link Requests">
      {requests.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-slate-500">No pending patient requests</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => {
            const patient = request.patientId && typeof request.patientId === 'object' 
              ? request.patientId 
              : null

            return (
              <div
                key={request._id}
                className="flex items-center justify-between border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">
                        {patient?.fullName || 'Unknown Patient'}
                      </div>
                      <div className="text-sm text-slate-500 flex items-center gap-4 mt-1">
                        {patient?.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {patient.email}
                          </span>
                        )}
                        {request.requestedAt && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(request.requestedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {patient?.gender && (
                    <div className="text-xs text-slate-600 ml-13">
                      Gender: {patient.gender}
                      {patient.dateOfBirth && ` • Age: ${new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()}`}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleAccept(request._id)}
                    disabled={processing[request._id]}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    {processing[request._id] === 'accepting' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Accepting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Accept
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDecline(request._id)}
                    disabled={processing[request._id]}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                  >
                    {processing[request._id] === 'declining' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Declining...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        Decline
                      </>
                    )}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
