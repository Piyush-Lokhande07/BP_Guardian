import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import Card from '../../components/Card'
import Input from '../../components/Input'
import { AlertCircle, CheckCircle, Clock, Loader2, Sunrise, Sun, Sunset, Moon, Star, UserX } from 'lucide-react'

export default function PatientDashboard() {
  const [bp, setBp] = useState({ systolic: '', diastolic: '', pulse: '' })
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [readings, setReadings] = useState([])
  const [latestAdvice, setLatestAdvice] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [dailyProgress, setDailyProgress] = useState(null)
  const [loadingProgress, setLoadingProgress] = useState(false)
  const [doctorStatus, setDoctorStatus] = useState({ approved: [], requested: [], declined: [] })
  const [loadingDoctors, setLoadingDoctors] = useState(false)

  // Fetch recent readings, latest advice, daily progress, and doctor status
  useEffect(() => {
    fetchReadings()
    fetchLatestAdvice()
    fetchDailyProgress()
    fetchDoctorStatus()
  }, [])

  const fetchReadings = async () => {
    try {
      const response = await api.get('/bp-readings?limit=30')
      if (response.data.success) {
        setReadings(response.data.data || [])
      }
    } catch (err) {
      console.error('Error fetching readings:', err)
    }
  }

  const fetchDailyProgress = async () => {
    try {
      setLoadingProgress(true)
      const response = await api.get('/bp-readings/daily-progress')
      if (response.data.success) {
        setDailyProgress(response.data.data)
      }
    } catch (err) {
      console.error('Error fetching daily progress:', err)
    } finally {
      setLoadingProgress(false)
    }
  }

  const fetchDoctorStatus = async () => {
    try {
      setLoadingDoctors(true)
  const response = await api.get('/users/my-doctors')
      if (response.data.success) {
        setDoctorStatus({
          approved: response.data.data.approved || [],
          requested: response.data.data.requested || [],
          declined: response.data.data.declined || []
        })
      }
    } catch (err) {
      console.error('Error fetching doctor status:', err)
    } finally {
      setLoadingDoctors(false)
    }
  }

  const fetchLatestAdvice = async () => {
    try {
  const response = await api.get('/recommendations?status=pending&limit=1')
      if (response.data.success && response.data.data.length > 0) {
        const advice = response.data.data[0]
        // Only show advice that hasn't been sent to doctors yet
        // If advice has assignedDoctorIds, it means it's been sent, so don't show it
        if (!advice.assignedDoctorIds || advice.assignedDoctorIds.length === 0) {
          setLatestAdvice(advice)
        } else {
          setLatestAdvice(null)
        }
      } else {
        setLatestAdvice(null)
      }
    } catch (err) {
      console.error('Error fetching advice:', err)
      setLatestAdvice(null)
    }
  }

  // Helper function to get time slot icon
  const getTimeSlotIcon = (slotId) => {
    const icons = {
      'morning': Sunrise,
      'late-morning': Sun,
      'afternoon': Sun,
      'evening': Sunset,
      'night': Moon
    }
    return icons[slotId] || Clock
  }

  // Helper function to get current time slot
  const getCurrentTimeSlot = () => {
    const hour = new Date().getHours()
    if (hour >= 6 && hour < 10) return 'morning'
    if (hour >= 10 && hour < 14) return 'late-morning'
    if (hour >= 14 && hour < 18) return 'afternoon'
    if (hour >= 18 && hour < 21) return 'evening'
    if (hour >= 21 || hour < 6) return 'night'
    return null
  }

  const submitBP = async (e) => {
    e.preventDefault()
    if (!bp.systolic || !bp.diastolic) {
      setError('Please enter both Systolic and Diastolic values')
      return
    }

    // Check if already completed 5 readings today
    if (dailyProgress && dailyProgress.isComplete) {
      setError('You have already entered all 5 readings for today. Please try again tomorrow.')
      return
    }

    setSubmitting(true)
    setError('')
    setSuccess('')

    try {
      // Auto-detect time slot
      const timeSlot = getCurrentTimeSlot()
      
      // Save BP reading
      const readingResponse = await api.post('/bp-readings', {
        systolic: parseInt(bp.systolic),
        diastolic: parseInt(bp.diastolic),
        heartRate: bp.pulse ? parseInt(bp.pulse) : undefined,
        source: 'manual',
        timeSlot: timeSlot
      })

      if (readingResponse.data.success) {
        setSuccess('BP reading saved successfully!')
        setBp({ systolic: '', diastolic: '', pulse: '' })
        
        // Refresh readings and daily progress
        await fetchReadings()
        await fetchDailyProgress()

        // Generate AI advice (but don't send to doctors yet)
        setLoading(true)
        try {
          const adviceResponse = await api.post('/recommendations/generate')
          if (adviceResponse.data.success) {
            setLatestAdvice(adviceResponse.data.data)
            setSuccess('BP reading saved and AI advice generated! You can send it to your approved doctors for review.')
          }
        } catch (adviceErr) {
          console.error('Error generating advice:', adviceErr)
          setError('BP saved, but failed to generate AI advice. Please try again.')
        } finally {
          setLoading(false)
        }
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to save BP reading'
      setError(errorMsg)
      console.error('Error saving BP:', err)
      
      // Refresh daily progress to get updated status
      await fetchDailyProgress()
    } finally {
      setSubmitting(false)
    }
  }

  const sendAdviceToDoctors = async () => {
    if (!latestAdvice) return

    // Check if patient has approved doctors
    if (doctorStatus.approved.length === 0) {
      setError('You need at least one approved doctor to send advice for review. Please wait for your doctor requests to be approved.')
      return
    }

    try {
      const doctorIds = doctorStatus.approved.map(d => d.doctorId._id || d.doctorId)
      const response = await api.post(`/recommendations/${latestAdvice._id}/assign`, {
        doctorIds
      })
      if (response.data.success) {
        setSuccess('Advice sent to your approved doctors for review! You can check the status in the History tab.')
        // Remove advice from dashboard after sending
        setLatestAdvice(null)
        await fetchLatestAdvice()
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send advice to doctors')
    }
  }


  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: Clock, text: 'Pending Doctor Approval', color: 'amber' },
      approved: { icon: CheckCircle, text: 'Approved', color: 'green' },
      rejected: { icon: AlertCircle, text: 'Rejected', color: 'red' },
      modified: { icon: CheckCircle, text: 'Modified & Approved', color: 'blue' }
    }
    const badge = badges[status] || badges.pending
    const Icon = badge.icon
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-${badge.color}-50 text-${badge.color}-700 border border-${badge.color}-200`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    )
  }

  const hasApprovedDoctors = doctorStatus.approved.length > 0
  const hasPendingRequests = doctorStatus.requested.length > 0

  return (
    <div className="space-y-6">
      {/* Doctor Approval Status Banner */}
      {!hasApprovedDoctors && (
        <Card>
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
            <UserX className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-amber-900 mb-1">Doctor Approval Pending</p>
              <p className="text-sm text-amber-800">
                {hasPendingRequests 
                  ? `You have ${doctorStatus.requested.length} doctor request${doctorStatus.requested.length > 1 ? 's' : ''} pending approval. Once a doctor approves your request, you'll be able to send AI advice for their review.`
                  : 'You haven\'t selected any doctors yet. Please go to your profile to request doctors.'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Daily BP Tracking Progress */}
      <Card title="Daily BP Tracking Progress">
        {loadingProgress ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="ml-2 text-sm text-gray-600">Loading progress...</span>
          </div>
        ) : dailyProgress ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {dailyProgress.timeSlots.map((slot) => {
                const Icon = getTimeSlotIcon(slot.id)
                const isCompleted = slot.completed
                return (
                  <div
                    key={slot.id}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      isCompleted
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`w-5 h-5 ${isCompleted ? 'text-green-600' : 'text-gray-400'}`} />
                      {isCompleted && <CheckCircle className="w-5 h-5 text-green-600" />}
                    </div>
                    <div className="text-sm font-medium text-gray-900">{slot.label}</div>
                    <div className="text-xs text-gray-600 mt-1">{slot.timeRange}</div>
                    {isCompleted && slot.reading && (
                      <div className="mt-2 pt-2 border-t border-green-200">
                        <div className="text-xs text-gray-700">
                          <div>{slot.reading.systolic}/{slot.reading.diastolic} mmHg</div>
                          {slot.reading.heartRate && (
                            <div className="text-gray-500">Pulse: {slot.reading.heartRate}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                <span className="font-medium">{dailyProgress.totalReadings}</span> of 5 readings completed today
              </div>
              {dailyProgress.isComplete ? (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">All readings complete!</span>
                </div>
              ) : (
                <div className="text-sm text-gray-600">
                  {dailyProgress.remainingSlots} slot{dailyProgress.remainingSlots !== 1 ? 's' : ''} remaining
                </div>
              )}
            </div>

            {dailyProgress.isComplete && dailyProgress.avgSystolic > 0 && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-sm font-medium text-green-900 mb-1">
                  ✅ Today's BP readings are complete. Great job tracking your blood pressure!
                </div>
                <div className="text-xs text-green-700 mt-2">
                  Today's Average: {dailyProgress.avgSystolic}/{dailyProgress.avgDiastolic} mmHg
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">No progress data available</p>
        )}
      </Card>

      <Card title="Enter Blood Pressure">
        <form onSubmit={submitBP} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <Input 
              label="Systolic" 
              type="number" 
              value={bp.systolic} 
              onChange={(e) => setBp({...bp, systolic: e.target.value})} 
              placeholder="e.g. 120" 
              required
            />
            <Input 
              label="Diastolic" 
              type="number" 
              value={bp.diastolic} 
              onChange={(e) => setBp({...bp, diastolic: e.target.value})} 
              placeholder="e.g. 80" 
              required
            />
            <Input 
              label="Pulse" 
              type="number" 
              value={bp.pulse} 
              onChange={(e) => setBp({...bp, pulse: e.target.value})} 
              placeholder="e.g. 72" 
            />
            <button 
              type="submit"
              disabled={submitting || loading || (dailyProgress && dailyProgress.isComplete)}
              className="self-end py-3 rounded-lg bg-linear-to-r from-blue-500 to-teal-500 text-white font-semibold hover:from-blue-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Add Reading'
              )}
            </button>
          </div>

          {dailyProgress && dailyProgress.isComplete && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <p className="text-sm text-amber-800">
                You've already entered all 5 readings for today. Please try again tomorrow.
              </p>
            </div>
          )}
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* AI Advice Section */}
        {loading && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <p className="text-sm text-blue-800">Generating AI advice...</p>
          </div>
        )}

        {latestAdvice && !loading && (
          <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-medium text-slate-900">AI Advice</h4>
              {getStatusBadge(latestAdvice.status)}
            </div>
            
            {latestAdvice.status === 'pending' && (
              <div className="mb-3 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                ⚠️ Not Approved Yet — Awaiting doctor review
              </div>
            )}

            {latestAdvice.lifestyleAdvice && latestAdvice.lifestyleAdvice.length > 0 && (
              <div className="mb-3">
                <p className="text-sm font-medium text-slate-700 mb-1">Lifestyle Recommendations:</p>
                <ul className="text-sm text-slate-600 space-y-1">
                  {latestAdvice.lifestyleAdvice.map((advice, idx) => (
                    <li key={idx}>• {advice}</li>
                  ))}
                </ul>
              </div>
            )}

            {latestAdvice.reasoning && (
              <div className="mb-3">
                <p className="text-sm font-medium text-slate-700 mb-1">Reasoning:</p>
                <p className="text-sm text-slate-600">{latestAdvice.reasoning}</p>
              </div>
            )}

            {latestAdvice.status === 'pending' && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                {hasApprovedDoctors ? (
                  <>
                    <p className="text-xs text-slate-600 mb-2">
                      Send this advice to your approved doctors for review:
                    </p>
                    <button
                      onClick={sendAdviceToDoctors}
                      className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Send to Approved Doctors ({doctorStatus.approved.length})
                    </button>
                  </>
                ) : (
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                    ⚠️ You need at least one approved doctor to send advice for review. 
                    {hasPendingRequests && ' Your doctor requests are pending approval.'}
                  </div>
                )}
              </div>
            )}

            {latestAdvice.doctorNotes && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <p className="text-xs font-medium text-slate-700 mb-1">Doctor Notes:</p>
                <p className="text-sm text-slate-600">{latestAdvice.doctorNotes}</p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
