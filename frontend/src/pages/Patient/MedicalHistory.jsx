import React, { useState, useEffect } from 'react'
import { api } from '../../services/api'
import Card from '../../components/Card'
import ChartBP from '../../components/ChartBP'
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function MedicalHistory() {
  const [notes, setNotes] = useState('')
  const [originalNotes, setOriginalNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [readings, setReadings] = useState([])
  const [classification, setClassification] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchTrend()
    fetchProfile()
  }, [])

  const fetchTrend = async () => {
    try {
      setLoading(true)
      const response = await api.get('/bp-readings/trend')
      if (response.data.success) {
        const trendData = response.data.data
        setReadings(trendData.readings || [])
        setClassification(trendData.classification || 'Normal')
      }
    } catch (err) {
      console.error('Error fetching trend:', err)
      setError('Failed to load BP trend data')
    } finally {
      setLoading(false)
    }
  }

  const fetchProfile = async () => {
    try {
  const response = await api.get('/users/me')
      if (response.data.success) {
        const user = response.data.data
        setNotes(user.medicalHistoryText || '')
        setOriginalNotes(user.medicalHistoryText || '')
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    }
  }

  const saveNotes = async () => {
    if (notes === originalNotes) {
      setSuccess('No changes to save')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
  const response = await api.put('/users/me', {
        medicalHistoryText: notes
      })

      if (response.data.success) {
        setOriginalNotes(notes)
        setSuccess('Medical history saved successfully!')
        setTimeout(() => setSuccess(''), 3000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save medical history')
      console.error('Error saving notes:', err)
    } finally {
      setSaving(false)
    }
  }

  // Prepare chart data
  const chartData = readings.map((r) => ({
    date: new Date(r.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    systolic: r.systolic,
    diastolic: r.diastolic
  }))

  const getClassificationColor = (classification) => {
    const colors = {
      'Normal': 'text-green-600 bg-green-50 border-green-200',
      'Elevated': 'text-yellow-600 bg-yellow-50 border-yellow-200',
      'High BP Stage 1': 'text-orange-600 bg-orange-50 border-orange-200',
      'High BP Stage 2': 'text-red-600 bg-red-50 border-red-200'
    }
    return colors[classification] || colors['Normal']
  }

  return (
    <div className="space-y-6">
      <Card title="Blood Pressure Trend (Last 30 Days)">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        ) : (
          <>
            {readings.length > 0 ? (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Average: {readings.length > 0 ? Math.round(readings.reduce((sum, r) => sum + r.systolic, 0) / readings.length) : 0}/{readings.length > 0 ? Math.round(readings.reduce((sum, r) => sum + r.diastolic, 0) / readings.length) : 0} mmHg</p>
                  </div>
                  {classification && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getClassificationColor(classification)}`}>
                      {classification}
                    </span>
                  )}
                </div>
                <ChartBP data={chartData} />
              </>
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">No readings available. Enter BP readings from the Dashboard.</p>
            )}
          </>
        )}
      </Card>

      <Card title="Medical History">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={6}
          className="w-full border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your medical history, including any known conditions, allergies, medications, surgeries, etc."
        />
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-slate-500">You can edit your medical history at any time.</p>
          <button
            onClick={saveNotes}
            disabled={saving || notes === originalNotes}
            className="px-4 py-2 rounded-lg bg-linear-to-r from-blue-500 to-teal-500 text-white hover:from-blue-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Notes'
            )}
          </button>
        </div>
      </Card>
    </div>
  )
}
