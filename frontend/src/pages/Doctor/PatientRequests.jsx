import React from 'react'
import Card from '../../components/Card'

export default function PatientRequests() {
  const requests = [
    { id:1, name:'Jane Doe', reason:'Link account for monitoring' },
    { id:2, name:'Mark Lee', reason:'Wants doctor oversight' },
  ]

  return (
    <Card title="Patient Link Requests">
      <div className="space-y-3">
        {requests.map(r => (
          <div key={r.id} className="flex items-center justify-between border border-slate-200 rounded-lg p-3">
            <div>
              <div className="font-medium">{r.name}</div>
              <div className="text-sm text-slate-500">{r.reason}</div>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm">Accept</button>
              <button className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm">Reject</button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
