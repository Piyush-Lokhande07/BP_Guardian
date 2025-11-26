import axios from 'axios'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: log helpful suggestions on errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Normalize error info
    const status = error.response?.status
    const url = error.config?.url
    const method = error.config?.method?.toUpperCase()
    console.error('[API] Request failed:', { method, url, status, message: error.message })

    // Friendly developer suggestions
    if (!error.response) {
      console.error('[API] No response received. Possible reasons: backend not running, CORS blocked, or network issue.')
      console.error('[API] Suggestions:')
      console.error('- Ensure your backend is running and reachable at', API_BASE_URL)
      console.error("- Check CORS settings on the backend (allow origin '" + (import.meta.env.VITE_FRONTEND_URL || 'http://localhost:5173') + "')")
      console.error('- Verify your VITE_API_BASE_URL environment variable in the frontend (.env)')
    } else if (status === 404) {
      console.error('[API] 404 Not Found for', url, '. Check that your frontend is calling the correct path and that the backend route exists.')
    } else if (status === 400) {
      console.error('[API] 400 Bad Request. The request payload may be invalid. Inspect the payload sent to', url)
    } else if (status === 401 || status === 403) {
      console.error('[API] Authentication/Authorization error. Check your token and backend auth configuration.')
    } else {
      console.error(`[API] HTTP ${status} returned from ${url}`)
    }

    // Re-throw so callers can handle as well
    return Promise.reject(error)
  }
)
