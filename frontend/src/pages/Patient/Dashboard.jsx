import React, { useState } from 'react'
import Card from '../../components/Card'
import Input from '../../components/Input'
import ChartBP from '../../components/ChartBP'

export default function PatientDashboard() {
  const [bp, setBp] = useState({ systolic: '', diastolic: '' })
  const [data, setData] = useState([
    { date: 'Mon', systolic: 130, diastolic: 85 },
    { date: 'Tue', systolic: 126, diastolic: 82 },
    { date: 'Wed', systolic: 132, diastolic: 84 },
    { date: 'Thu', systolic: 128, diastolic: 80 },
    { date: 'Fri', systolic: 125, diastolic: 79 },
  ])

  const submit = (e) => {
    e.preventDefault()
    if (!bp.systolic || !bp.diastolic) return
    setData([...data, { date: `${data.length+1}`, systolic: Number(bp.systolic), diastolic: Number(bp.diastolic) }])
    setBp({ systolic:'', diastolic:'' })
  }

  return (
    <div className="space-y-6">
      <Card title="Enter Blood Pressure">
        <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input label="Systolic" value={bp.systolic} onChange={(e)=>setBp({...bp, systolic:e.target.value})} placeholder="e.g. 120" />
          <Input label="Diastolic" value={bp.diastolic} onChange={(e)=>setBp({...bp, diastolic:e.target.value})} placeholder="e.g. 80" />
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
