import React from 'react'

export default function Card({ title, children, actions, className = '' }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-5 shadow-sm ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="font-semibold text-slate-800">{title}</h3>}
          {actions}
        </div>
      )}
      {children}
    </div>
  )
}
