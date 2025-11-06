import React, { useState } from 'react'
import Card from '../../components/Card'

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { from:'ai', text:'Hello! I can help with lifestyle guidance. How are you feeling today?' }
  ])
  const [input, setInput] = useState('')
  const send = (e) => {
    e.preventDefault()
    if (!input.trim()) return
    setMessages([...messages, { from:'user', text: input }, { from:'ai', text:'Got it. Try a 10-minute walk and hydrate well.' }])
    setInput('')
  }
  return (
    <Card title="Lifestyle Assistant">
      <div className="h-80 overflow-y-auto space-y-3 p-2 bg-slate-50 rounded-lg">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[75%] px-3 py-2 rounded-lg ${m.from==='ai' ? 'bg-white border border-slate-200' : 'ml-auto bg-blue-600 text-white'}`}>{m.text}</div>
        ))}
      </div>
      <form onSubmit={send} className="mt-3 flex gap-2">
        <input value={input} onChange={(e)=>setInput(e.target.value)} className="flex-1 border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Type your message..." />
        <button className="px-4 py-2 rounded-lg bg-linear-to-r from-blue-500 to-teal-500 text-white">Send</button>
      </form>
    </Card>
  )
}
