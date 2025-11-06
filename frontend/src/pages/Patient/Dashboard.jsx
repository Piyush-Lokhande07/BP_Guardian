import React, { useState } from 'react'
import Card from '../../components/Card'
import Input from '../../components/Input'
import ChartBP from '../../components/ChartBP'

export default function PatientDashboard() {
  const [bp, setBp] = useState({ systolic: '', diastolic: '', pulse: '' })
  const [data, setData] = useState([
    { date: 'Mon', systolic: 130, diastolic: 85, pulse: 74 },
    { date: 'Tue', systolic: 126, diastolic: 82, pulse: 71 },
    { date: 'Wed', systolic: 132, diastolic: 84, pulse: 76 },
    { date: 'Thu', systolic: 128, diastolic: 80, pulse: 70 },
    { date: 'Fri', systolic: 125, diastolic: 79, pulse: 72 },
  ])

  const submit = (e) => {
    e.preventDefault()
    if (!bp.systolic || !bp.diastolic) return
    setData([
      ...data,
      {
        date: `${data.length + 1}`,
        systolic: Number(bp.systolic),
        diastolic: Number(bp.diastolic),
        pulse: bp.pulse ? Number(bp.pulse) : undefined,
      },
    ])
    setBp({ systolic: '', diastolic: '', pulse: '' })
  }

  return (
    <div className="space-y-6">
      <Card title="Enter Blood Pressure">
        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <Input label="Systolic" type="number" value={bp.systolic} onChange={(e)=>setBp({...bp, systolic:e.target.value})} placeholder="e.g. 120" />
          <Input label="Diastolic" type="number" value={bp.diastolic} onChange={(e)=>setBp({...bp, diastolic:e.target.value})} placeholder="e.g. 80" />
          <Input label="Pulse" type="number" value={bp.pulse} onChange={(e)=>setBp({...bp, pulse:e.target.value})} placeholder="e.g. 72" />
          <button className="self-end py-3 rounded-lg bg-linear-to-r from-blue-500 to-teal-500 text-white font-semibold">Save Reading</button>
        </form>
        <div className="mt-6">
          <h4 className="font-medium mb-2">AI Advice — Pending Doctor Approval</h4>
          <div className="text-sm text-slate-600">Maintain low-sodium diet and take a 20-minute walk. Reduce stress with breathing exercises.</div>
        </div>
      </Card>

      <Card title="Recent Trend">
        <ChartBP data={data} />
      </Card>
    </div>
  )
}
