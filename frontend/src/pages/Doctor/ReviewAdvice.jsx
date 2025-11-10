import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import Card from '../../components/Card'
import ChartBP from '../../components/ChartBP'
import { Loader2, CheckCircle, XCircle, Edit, User, AlertCircle, HeartPulse } from 'lucide-react'

export default function ReviewAdvice() {
  const [recommendations, setRecommendations] = useState([])
  const [selectedRec, setSelectedRec] = useState(null)
  const [patientData, setPatientData] = useState(null)
  const [bpReadings, setBpReadings] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [action, setAction] = useState(null) // 'approve', 'reject', 'modify'
  const [doctorNotes, setDoctorNotes] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPendingRecommendations()
  }, [])

  useEffect(() => {
    if (selectedRec) {
      fetchPatientContext(selectedRec.patientId._id || selectedRec.patientId)
    }
  }, [selectedRec])

  const fetchPendingRecommendations = async () => {
    try {
      setLoading(true)
      const response = await api.get('/recommendations/pending?assignedToMe=true')
      if (response.data.success) {
        setRecommendations(response.data.data || [])
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPatientContext = async (patientId) => {
    try {
      // Fetch patient overview
      const overviewResponse = await api.get(`/doctor-dashboard/patient-overview/${patientId}`)
      if (overviewResponse.data.success) {
        setPatientData(overviewResponse.data.data.patient)
        setBpReadings(overviewResponse.data.data.bpStats.readings || [])
      }
    } catch (err) {
      console.error('Error fetching patient context:', err)
    }
  }

  const handleAction = (rec, actionType) => {
    setSelectedRec(rec)
    setAction(actionType)
    setDoctorNotes('')
    setError('')
    setShowModal(true)
  }

  const submitAction = async () => {
    if (!selectedRec) return

    if (action === 'reject' && !doctorNotes.trim()) {
      setError('Doctor notes are required for rejection')
      return
    }

    if (action === 'modify' && !doctorNotes.trim()) {
      setError('Doctor notes with modifications are required')
      return
    }

    setProcessing(true)
    setError('')

    try {
      let response
      if (action === 'approve') {
        response = await api.put(`/recommendations/${selectedRec._id}/approve`, {
          doctorNotes: doctorNotes || undefined
        })
      } else if (action === 'reject') {
        response = await api.put(`/recommendations/${selectedRec._id}/reject`, {
          doctorNotes: doctorNotes
        })
      } else if (action === 'modify') {
        response = await api.put(`/recommendations/${selectedRec._id}/modify`, {
          doctorNotes: doctorNotes
        })
      }

      if (response.data.success) {
        // Remove from list
        setRecommendations(recommendations.filter(r => r._id !== selectedRec._id))
        setShowModal(false)
        setSelectedRec(null)
        setAction(null)
        setDoctorNotes('')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to process action')
      console.error('Error processing action:', err)
    } finally {
      setProcessing(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  // Prepare chart data
  const chartData = bpReadings.slice(0, 30).reverse().map((r) => ({
    date: new Date(r.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    systolic: r.systolic,
    diastolic: r.diastolic
  }))

  if (loading) {
    return (
      <Card title="AI Suggestions to Review">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </Card>
    )
  }

  return (
    <>
      <Card title="AI Suggestions to Review">
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500">No pending recommendations to review</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec) => {
              const patient = rec.patientId && typeof rec.patientId === 'object' 
                ? rec.patientId 
                : null

              return (
                <div
                  key={rec._id}
                  className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-5 h-5 text-slate-400" />
                        <div className="font-medium text-slate-900">
                          {patient?.fullName || patient?.email || 'Patient'}
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          Pending
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 mb-2">
                        Created: {formatDate(rec.createdAt)}
                      </div>
                      
                      {/* BP Value that triggered advice */}
                      {rec.bpAverage && (
                        <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded flex items-center gap-2">
                          <HeartPulse className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-blue-800">
                            BP: {rec.bpAverage.systolic}/{rec.bpAverage.diastolic} mmHg
                          </span>
                        </div>
                      )}

                      {/* Lifestyle Advice */}
                      {rec.lifestyleAdvice && rec.lifestyleAdvice.length > 0 && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-slate-700 mb-1">Lifestyle Recommendations:</p>
                          <ul className="text-sm text-slate-600 space-y-1">
                            {rec.lifestyleAdvice.map((advice, idx) => (
                              <li key={idx}>• {advice}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Reasoning */}
                      {rec.reasoning && (
                        <div className="mb-2">
                          <p className="text-sm font-medium text-slate-700 mb-1">AI Reasoning:</p>
                          <p className="text-sm text-slate-600">{rec.reasoning}</p>
                        </div>
                      )}

                      {/* Medications (doctor-only) */}
                      {rec.medications && rec.medications.length > 0 && (
                        <div className="mb-2 p-2 bg-slate-50 border border-slate-200 rounded">
                          <p className="text-xs font-medium text-slate-700 mb-1">Suggested Medications (for doctor review):</p>
                          <ul className="text-xs text-slate-600 space-y-1">
                            {rec.medications.map((med, idx) => (
                              <li key={idx}>
                                • {med.name} - {med.dosage} ({med.frequency}) - ₹{med.cost}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-slate-200">
                    <button
                      onClick={() => handleAction(rec, 'approve')}
                      className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(rec, 'reject')}
                      className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm hover:bg-red-700 transition-colors flex items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </button>
                    <button
                      onClick={() => handleAction(rec, 'modify')}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Modify
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Modal for Action */}
      {showModal && selectedRec && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">
                {action === 'approve' && 'Approve Recommendation'}
                {action === 'reject' && 'Reject Recommendation'}
                {action === 'modify' && 'Modify & Approve Recommendation'}
              </h3>

              {/* Patient Context */}
              {patientData && (
                <div className="mb-6 space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                    <h4 className="font-medium text-slate-900 mb-3">Patient Profile Snapshot</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span className="text-slate-600">Name:</span> <span className="font-medium">{patientData.fullName || 'N/A'}</span></div>
                      <div><span className="text-slate-600">Age:</span> <span className="font-medium">{patientData.age || 'N/A'}</span></div>
                      <div><span className="text-slate-600">Gender:</span> <span className="font-medium">{patientData.gender || 'N/A'}</span></div>
                      <div><span className="text-slate-600">Blood Group:</span> <span className="font-medium">{patientData.bloodGroup || 'N/A'}</span></div>
                    </div>
                    {patientData.medicalHistoryText && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <p className="text-xs text-slate-600 mb-1">Medical History:</p>
                        <p className="text-sm text-slate-700">{patientData.medicalHistoryText}</p>
                      </div>
                    )}
                  </div>

                  {/* BP Trend Graph */}
                  {chartData.length > 0 && (
                    <div className="p-4 bg-white border border-slate-200 rounded-lg">
                      <h4 className="font-medium text-slate-900 mb-3">BP Trend (Last 30 Days)</h4>
                      <ChartBP data={chartData} />
                    </div>
                  )}
                </div>
              )}

              {/* AI Suggestion Summary */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">AI Suggestion Summary</h4>
                {selectedRec.lifestyleAdvice && selectedRec.lifestyleAdvice.length > 0 && (
                  <ul className="text-sm text-blue-800 space-y-1">
                    {selectedRec.lifestyleAdvice.map((advice, idx) => (
                      <li key={idx}>• {advice}</li>
                    ))}
                  </ul>
                )}
                {selectedRec.reasoning && (
                  <p className="text-sm text-blue-700 mt-2">{selectedRec.reasoning}</p>
                )}
              </div>

              {/* Doctor Notes */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Doctor Notes {action === 'reject' || action === 'modify' ? '*' : ''}
                </label>
                <textarea
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  rows={4}
                  className="w-full border border-gray-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={
                    action === 'approve' ? 'Optional notes for the patient...' :
                    action === 'reject' ? 'Please provide reason for rejection (required)...' :
                    'Please describe the modifications (required)...'
                  }
                  required={action === 'reject' || action === 'modify'}
                />
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowModal(false)
                    setSelectedRec(null)
                    setAction(null)
                    setDoctorNotes('')
                    setError('')
                  }}
                  disabled={processing}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={submitAction}
                  disabled={processing}
                  className={`px-4 py-2 rounded-lg text-white text-sm hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 ${
                    action === 'approve' ? 'bg-green-600' :
                    action === 'reject' ? 'bg-red-600' :
                    'bg-blue-600'
                  }`}
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {action === 'approve' && 'Approve'}
                      {action === 'reject' && 'Reject'}
                      {action === 'modify' && 'Modify & Approve'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
