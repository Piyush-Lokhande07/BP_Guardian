import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export default function ChartBP({ data = [] }) {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis domain={[60, 200]} tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey="systolic" stroke="#3b82f6" strokeWidth={2} dot={false} name="Systolic" />
          <Line type="monotone" dataKey="diastolic" stroke="#14b8a6" strokeWidth={2} dot={false} name="Diastolic" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
