import React from 'react'
import Card from '../../components/Card'

const items = [
  { id:1, date:'2025-10-10', advice:'Reduce salt intake, 30m walk daily', status:'Approved' },
  { id:2, date:'2025-10-12', advice:'Hydrate, BP check after rest', status:'Pending' },
  { id:3, date:'2025-10-16', advice:'Consult for medication adjustment', status:'Rejected' },
]

export default function History() {
  return (
    <Card title="AI Suggestions History">
      <div className="divide-y">
        {items.map(it => (
          <div key={it.id} className="py-4 flex items-start justify-between">
            <div>
              <div className="text-sm text-slate-500">{it.date}</div>
              <div className="text-slate-800">{it.advice}</div>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full border ${it.status==='Approved' ? 'bg-green-50 text-green-700 border-green-200' : it.status==='Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-red-50 text-red-700 border-red-200'}`}>{it.status}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
