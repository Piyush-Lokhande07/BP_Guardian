import React from 'react'
import Card from '../../components/Card'

export default function Patients() {
  const pts = [
    { id:'p1', name:'Jane Doe', last:'2h ago' },
    { id:'p2', name:'Mark Lee', last:'1d ago' },
  ]
  return (
    <Card title="Assigned Patients">
      <ul className="divide-y">
        {pts.map(p => (
          <li key={p.id} className="py-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{p.name}</div>
              <div className="text-xs text-slate-500">Last check-in {p.last}</div>
            </div>
            <a href={`/doctor/patients/${p.id}`} className="text-blue-600">View</a>
          </li>
        ))}
      </ul>
    </Card>
  )
}
