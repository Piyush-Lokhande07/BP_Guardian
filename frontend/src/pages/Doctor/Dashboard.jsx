import React from 'react'
import Card from '../../components/Card'

export default function DoctorDashboard() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card title="Pending Advice Approvals">
        <ul className="space-y-3">
          {[1,2,3].map(i => (
            <li key={i} className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-800">Patient #{i}</div>
                <div className="text-sm text-slate-500">AI suggests: adjust medication dosage</div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm">Approve</button>
                <button className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm">Reject</button>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Summary">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <div className="text-slate-500 text-sm">Assigned Patients</div>
            <div className="text-2xl font-semibold">32</div>
          </div>
          <div className="p-4 rounded-xl border border-slate-200 bg-white">
            <div className="text-slate-500 text-sm">Pending Reviews</div>
            <div className="text-2xl font-semibold">5</div>
          </div>
        </div>
      </Card>
    </div>
  )
}
