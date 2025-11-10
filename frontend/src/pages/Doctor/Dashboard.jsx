import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../services/api'
import Card from '../../components/Card'
import { Loader2, Users, ClipboardCheck, CheckCircle, Clock, Stethoscope, AlertCircle, ArrowRight } from 'lucide-react'

export default function DoctorDashboard() {
  const [stats, setStats] = useState({
    pendingReviews: 0,
    approvedToday: 0,
    modifiedToday: 0,
    totalPatients: 0
  })
  const [pendingAdvice, setPendingAdvice] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
    fetchPendingAdvice()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await api.get('/doctor-dashboard/stats')
      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  const fetchPendingAdvice = async () => {
    try {
      setLoading(true)
  const response = await api.get('/recommendations/pending?assignedToMe=true')
      if (response.data.success) {
        setPendingAdvice(response.data.data.slice(0, 5)) // Show top 5
      }
    } catch (err) {
      console.error('Error fetching pending advice:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Doctor Dashboard Header */}
      <div className="bg-linear-to-r from-blue-500 to-teal-500 rounded-xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Stethoscope className="w-8 h-8" />
          <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
        </div>
        <p className="text-blue-50">Review AI-generated recommendations and manage your patients</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
      <Card title="Summary">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div className="text-slate-500 text-sm">Assigned Patients</div>
            </div>
            <div className="text-2xl font-semibold">{stats.totalPatients}</div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardCheck className="w-5 h-5 text-amber-600" />
              <div className="text-slate-500 text-sm">Pending Reviews</div>
            </div>
            <div className="text-2xl font-semibold">{stats.pendingReviews}</div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div className="text-slate-500 text-sm">Approved Today</div>
            </div>
            <div className="text-2xl font-semibold">{stats.approvedToday}</div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <div className="text-slate-500 text-sm">Modified Today</div>
            </div>
            <div className="text-2xl font-semibold">{stats.modifiedToday}</div>
          </div>
        </div>
      </Card>

      <Card title="Pending Advice Approvals">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : pendingAdvice.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No pending advice reviews</p>
            <p className="text-xs text-slate-400 mt-1">All recommendations have been reviewed</p>
          </div>
        ) : (
          <>
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">Action Required</p>
                <p className="text-xs text-amber-700 mt-1">You have {pendingAdvice.length} AI recommendation{pendingAdvice.length > 1 ? 's' : ''} awaiting your review</p>
              </div>
            </div>
            <ul className="space-y-3">
              {pendingAdvice.map((item) => (
                <li key={item._id} className="flex items-center justify-between border border-slate-200 rounded-lg p-3 hover:border-blue-300 transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-slate-800">
                      {item.patientId && typeof item.patientId === 'object' 
                        ? item.patientId.fullName || item.patientId.email 
                        : 'Patient'}
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      {item.lifestyleAdvice && item.lifestyleAdvice.length > 0
                        ? item.lifestyleAdvice[0]
                        : 'AI suggestion pending review'}
                    </div>
                    {item.bpAverage && (
                      <div className="text-xs text-slate-400 mt-1">
                        BP: {item.bpAverage.systolic}/{item.bpAverage.diastolic} mmHg
                      </div>
                    )}
                  </div>
                  <Link
                    to="/doctor/review-advice"
                    className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    Review
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </li>
              ))}
            </ul>
            {pendingAdvice.length >= 5 && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <Link
                  to="/doctor/review-advice"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  View all pending reviews
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </>
        )}
      </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/doctor/patient-requests"
            className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center gap-3"
          >
            <Users className="w-6 h-6 text-blue-600" />
            <div>
              <div className="font-medium text-slate-900">Patient Requests</div>
              <div className="text-xs text-slate-500">Review new patient link requests</div>
            </div>
          </Link>
          <Link
            to="/doctor/patients"
            className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center gap-3"
          >
            <Stethoscope className="w-6 h-6 text-teal-600" />
            <div>
              <div className="font-medium text-slate-900">Assigned Patients</div>
              <div className="text-xs text-slate-500">View all your assigned patients</div>
            </div>
          </Link>
          <Link
            to="/doctor/review-advice"
            className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all flex items-center gap-3"
          >
            <ClipboardCheck className="w-6 h-6 text-amber-600" />
            <div>
              <div className="font-medium text-slate-900">Review Advice</div>
              <div className="text-xs text-slate-500">Approve or modify AI recommendations</div>
            </div>
          </Link>
        </div>
      </Card>
    </div>
  )
}
