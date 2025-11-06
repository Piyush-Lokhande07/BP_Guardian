import React, { useState } from 'react'
import Card from '../../components/Card'
import ChartBP from '../../components/ChartBP'

export default function MedicalHistory() {
  const [notes, setNotes] = useState('Hypertension diagnosed 2024. Medication: Amlodipine 5mg daily.')
  const data = [
    { date: 'Aug', systolic: 134, diastolic: 86 },
    { date: 'Sep', systolic: 130, diastolic: 84 },
    { date: 'Oct', systolic: 128, diastolic: 82 },
    { date: 'Nov', systolic: 126, diastolic: 81 },
  ]

  return (
    <div className="space-y-6">
      <Card title="Blood Pressure Trend">
        <ChartBP data={data} />
      </Card>
      <Card title="Medical Notes">
        <textarea value={notes} onChange={(e)=>setNotes(e.target.value)} rows={6} className="w-full border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <div className="mt-3 text-right">
          <button className="px-4 py-2 rounded-lg bg-linear-to-r from-blue-500 to-teal-500 text-white">Save Notes</button>
        </div>
      </Card>
    </div>
  )
}
