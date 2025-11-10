import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../services/api'
import Card from '../../components/Card'
import ChartBP from '../../components/ChartBP'
import { Loader2, AlertCircle } from 'lucide-react'

export default function PatientDetails() {
  const { patientId } = useParams()
  const [patient, setPatient] = useState(null)
  const [bpReadings, setBpReadings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (patientId) {
      fetchPatientDetails()
    }
  }, [patientId])

  const fetchPatientDetails = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Use the doctor-dashboard patient-overview route
      const response = await api.get(`/doctor-dashboard/patient-overview/${patientId}`)
      
      if (response.data.success) {
        const data = response.data.data
        setPatient(data.patient)
        // Get BP readings from the response
        const readings = data.bpStats?.readings || []
        // Filter to last 30 days for the graph
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const recentReadings = readings.filter(r => new Date(r.timestamp) >= thirtyDaysAgo)
        setBpReadings(recentReadings)
      } else {
        setError('Failed to load patient details')
      }
    } catch (err) {
      console.error('Error fetching patient details:', err)
      setError(err.response?.data?.message || 'Failed to load patient details. Please check if the patient is assigned to you.')
    } finally {
      setLoading(false)
    }
  }

  // Prepare chart data from actual readings
  const chartData = bpReadings
    .slice(0, 30)
    .reverse()
    .map((r) => ({
      date: new Date(r.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      systolic: r.systolic,
      diastolic: r.diastolic,
      pulse: r.heartRate
    }))

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading patient details...</span>
      </div>
    )
  }

  if (error || !patient) {
    return (
      <Card>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-sm text-red-800">{error || 'Patient not found'}</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Medical History */}
      <Card title="Medical History">
        {patient?.medicalHistoryText ? (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {patient.medicalHistoryText}
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-8">
            No medical history available for this patient.
          </p>
        )}
      </Card>

      {/* BP Graph */}
      <Card title="Blood Pressure Trend (Last 30 Days)">
        {chartData.length > 0 ? (
          <ChartBP data={chartData} />
        ) : (
          <p className="text-sm text-gray-500 text-center py-8">
            No BP readings available for this patient yet.
          </p>
        )}
      </Card>
    </div>
  )
}
