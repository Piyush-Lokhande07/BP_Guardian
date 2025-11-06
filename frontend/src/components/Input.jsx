import React from 'react'

export default function Input({ label, type='text', value, onChange, placeholder, right, left, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>}
      <div className="relative">
        {left && <div className="absolute left-3 top-1/2 -translate-y-1/2">{left}</div>}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full ${left ? 'pl-10' : 'pl-3'} ${right ? 'pr-10' : 'pr-3'} py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
          {...props}
        />
        {right && <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>}
      </div>
    </div>
  )}
