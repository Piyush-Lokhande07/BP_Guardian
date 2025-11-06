import React from 'react'
import Card from '../../components/Card'
import ChartBP from '../../components/ChartBP'

export default function PatientDetails() {
  const data = [
    { date: 'Mon', systolic: 130, diastolic: 85 },
    { date: 'Tue', systolic: 126, diastolic: 82 },
    { date: 'Wed', systolic: 132, diastolic: 84 },
    { date: 'Thu', systolic: 128, diastolic: 80 },
    { date: 'Fri', systolic: 125, diastolic: 79 },
  ]
  return (
    <div className="space-y-6">
      <Card title="Patient BP Graph">
        <ChartBP data={data} />
      </Card>
      <Card title="AI Context">
        <p className="text-sm text-slate-700">AI indicates stress-related spikes in the evenings. Consider advising relaxation techniques and evening walks.</p>
      </Card>
    </div>
  )
}
