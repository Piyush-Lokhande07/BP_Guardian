import React from 'react'
import Card from '../../components/Card'

export default function ReviewAdvice() {
  const items = [
    { id:1, patient:'Jane Doe', advice:'Increase daily steps to 7k', status:'Pending' },
    { id:2, patient:'Mark Lee', advice:'Reduce caffeine intake', status:'Pending' },
  ]
  return (
    <Card title="AI Suggestions to Review">
      <div className="space-y-3">
        {items.map(it => (
          <div key={it.id} className="border border-slate-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{it.patient}</div>
                <div className="text-sm text-slate-600">{it.advice}</div>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">{it.status}</span>
            </div>
            <div className="mt-3 flex gap-2">
              <button className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm">Approve</button>
              <button className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm">Reject</button>
              <button className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-sm">Modify</button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
