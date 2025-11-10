import React, { useState, useEffect, useRef } from 'react'
import { api } from '../../services/api'
import Card from '../../components/Card'
import { Send, Loader2, AlertCircle, Trash2 } from 'lucide-react'
import Swal from 'sweetalert2'

export default function Chatbot() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [clearing, setClearing] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchHistory()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchHistory = async () => {
    try {
      setLoading(true)
  const response = await api.get('/chatbot/history?limit=50')
      if (response.data.success) {
        const history = response.data.data || []
        // Convert to message format
        const formattedMessages = history.map(msg => ({
          from: msg.role === 'user' ? 'user' : 'ai',
          text: msg.content,
          timestamp: msg.timestamp
        }))
        
        // If no history, add welcome message
        if (formattedMessages.length === 0) {
          setMessages([{
            from: 'ai',
            text: 'Hello! I\'m your lifestyle assistant. I can help you with:\n\n• Exercise recommendations\n• Diet and nutrition advice\n• Stress management techniques\n• Sleep hygiene tips\n• General wellness guidance\n\n⚠️ Important: I provide lifestyle suggestions only. I cannot prescribe medications or provide medical diagnoses. For medication questions or medical concerns, please consult with your doctor.\n\nHow can I help you today?'
          }])
        } else {
          setMessages(formattedMessages)
        }
      }
    } catch (err) {
      console.error('Error fetching chat history:', err)
      setMessages([{
        from: 'ai',
        text: 'Hello! I\'m your lifestyle assistant. How can I help you today?'
      }])
    } finally {
      setLoading(false)
    }
  }

  const clearChat = async () => {
    const result = await Swal.fire({
      title: 'Clear Chat History?',
      text: 'Are you sure you want to clear all chat history? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, clear it!',
      cancelButtonText: 'Cancel'
    })

    if (!result.isConfirmed) {
      return
    }

    try {
      setClearing(true)
      setError('')
  const response = await api.delete('/chatbot/history')
      if (response.data.success) {
        setMessages([{
          from: 'ai',
          text: 'Hello! I\'m your lifestyle assistant. I can help you with:\n\n• Exercise recommendations\n• Diet and nutrition advice\n• Stress management techniques\n• Sleep hygiene tips\n• General wellness guidance\n\n⚠️ Important: I provide lifestyle suggestions only. I cannot prescribe medications or provide medical diagnoses. For medication questions or medical concerns, please consult with your doctor.\n\nHow can I help you today?'
        }])
        await Swal.fire({
          title: 'Cleared!',
          text: 'Chat history has been cleared successfully.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        })
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to clear chat history'
      setError(errorMsg)
      console.error('Clear chat error:', err)
      await Swal.fire({
        title: 'Error!',
        text: errorMsg,
        icon: 'error',
        confirmButtonText: 'OK'
      })
    } finally {
      setClearing(false)
    }
  }

  const send = async (e) => {
    e.preventDefault()
    if (!input.trim() || sending) return

    const userMessage = input.trim()
    setInput('')
    setError('')
    setSending(true)

    // Add user message immediately
    const newUserMessage = { from: 'user', text: userMessage, timestamp: new Date() }
    setMessages(prev => [...prev, newUserMessage])

    try {
  const response = await api.post('/chatbot/message', {
        message: userMessage
      })

      if (response.data.success) {
        const aiResponse = response.data.data.assistantMessage.content
        setMessages(prev => [...prev, {
          from: 'ai',
          text: aiResponse,
          timestamp: new Date(response.data.data.assistantMessage.timestamp)
        }])
      } else {
        throw new Error('Failed to get response')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.')
      console.error('Chatbot error:', err)
      // Add error message
      setMessages(prev => [...prev, {
        from: 'ai',
        text: 'I apologize, but I\'m having trouble processing your request right now. Please try again later or contact support. For urgent medical questions, please consult with your doctor immediately.',
        timestamp: new Date()
      }])
    } finally {
      setSending(false)
    }
  }

  return (
    <Card title="Lifestyle Assistant">
      <div className="mb-4 flex items-center justify-between">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex-1">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-800">
              <p className="font-medium mb-1">Lifestyle Guidance Only</p>
              <p>This chatbot provides lifestyle suggestions (exercise, diet, stress management). It cannot prescribe medications or provide medical diagnoses. For medication questions, please consult your doctor.</p>
            </div>
          </div>
        </div>
        {messages.length > 1 && (
          <button
            onClick={clearChat}
            disabled={clearing}
            className="ml-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            title="Clear chat history"
          >
            {clearing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="h-80 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          <div className="h-80 overflow-y-auto space-y-3 p-2 bg-slate-50 rounded-lg">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[75%] px-3 py-2 rounded-lg ${
                  m.from === 'ai'
                    ? 'bg-white border border-slate-200 text-slate-800'
                    : 'ml-auto bg-blue-600 text-white'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{m.text}</p>
              </div>
            ))}
            {sending && (
              <div className="max-w-[75%] px-3 py-2 rounded-lg bg-white border border-slate-200">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {error && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={send} className="mt-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending}
              className="flex-1 border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              placeholder="Ask about exercise, diet, stress management..."
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="px-4 py-2 rounded-lg bg-linear-to-r from-blue-500 to-teal-500 text-white hover:from-blue-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>
        </>
      )}
    </Card>
  )
}
