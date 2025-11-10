import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import Card from '../../components/Card'
import { Clock, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react'

export default function History() {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchRecommendations()
  }, [])

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
  const response = await api.get('/api/recommendations?limit=50')
      if (response.data.success) {
        setRecommendations(response.data.data || [])
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load recommendations')
      console.error('Error fetching recommendations:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { icon: Clock, text: 'Pending', color: 'amber', bg: 'bg-amber-50', textColor: 'text-amber-700', border: 'border-amber-200' },
      approved: { icon: CheckCircle, text: 'Approved', color: 'green', bg: 'bg-green-50', textColor: 'text-green-700', border: 'border-green-200' },
      rejected: { icon: XCircle, text: 'Rejected', color: 'red', bg: 'bg-red-50', textColor: 'text-red-700', border: 'border-red-200' },
      modified: { icon: CheckCircle, text: 'Modified & Approved', color: 'blue', bg: 'bg-blue-50', textColor: 'text-blue-700', border: 'border-blue-200' }
    }
    const badge = badges[status] || badges.pending
    const Icon = badge.icon
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.textColor} ${badge.border} border`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    )
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
  }

  if (loading) {
    return (
      <Card title="AI Suggestions History">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card title="AI Suggestions History">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      </Card>
    )
  }

  return (
    <Card title="AI Suggestions History">
      {recommendations.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-slate-500">No recommendations yet. Generate your first AI advice from the Dashboard.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-200">
          {recommendations.map((rec) => (
            <div key={rec._id} className="py-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="text-sm text-slate-500 mb-1">{formatDate(rec.createdAt)}</div>
                  
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
                      <p className="text-sm text-slate-600">{rec.reasoning}</p>
                    </div>
                  )}

                  {/* Doctor Notes (if rejected or modified) */}
                  {rec.doctorNotes && (rec.status === 'rejected' || rec.status === 'modified') && (
                    <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded">
                      <p className="text-xs font-medium text-slate-700 mb-1">Doctor Comment:</p>
                      <p className="text-sm text-slate-600">{rec.doctorNotes}</p>
                    </div>
                  )}

                  {/* Reviewed By */}
                  {rec.doctorId && typeof rec.doctorId === 'object' && rec.doctorId.doctorName && (
                    <div className="mt-2 text-xs text-slate-500">
                      Reviewed by: {rec.doctorId.doctorName}
                      {rec.reviewedAt && ` on ${formatDate(rec.reviewedAt)}`}
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  {getStatusBadge(rec.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
