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
  const hasPulse = Array.isArray(data) && data.some((d) => d && d.pulse != null)
  
  // Custom tooltip to show actual readings
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 mb-1">{data.date}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.dataKey === 'systolic' || entry.dataKey === 'diastolic' ? ' mmHg' : entry.dataKey === 'pulse' ? ' bpm' : ''}
            </p>
          ))}
          {data.systolic && data.diastolic && (
            <p className="text-xs text-gray-500 mt-1">
              BP: {data.systolic}/{data.diastolic} mmHg
            </p>
          )}
        </div>
      )
    }
    return null
  }
  
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis domain={[60, 200]} tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="linear" dataKey="systolic" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: "#3b82f6" }} name="Systolic" />
          <Line type="linear" dataKey="diastolic" stroke="#14b8a6" strokeWidth={2} dot={{ r: 4, fill: "#14b8a6" }} name="Diastolic" />
          {hasPulse && (
            <Line type="linear" dataKey="pulse" stroke="#f59e0b" strokeWidth={2} dot={{ r: 4, fill: "#f59e0b" }} name="Pulse" />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
