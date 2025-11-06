import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState(null)
	const navigate = useNavigate()

	const validateEmail = (value) => /[^\s@]+@[^\s@]+\.[^\s@]+/.test(value)

	const handleLogin = (e) => {
		e.preventDefault()
		setError(null)
		if (!email || !password) {
			setError('Please fill in all fields.')
			return
		}
		if (!validateEmail(email)) {
			setError('Please enter a valid email address.')
			return
		}
		setIsLoading(true)
		setTimeout(() => {
			setIsLoading(false)
			navigate('/')
		}, 500)
	}

	return (
		<div className="w-full sm:h-[88vh] flex">
			<div className="relative w-1/2 flex flex-col items-center justify-center space-y-6 overflow-hidden backdrop-blur">
				<form onSubmit={handleLogin} className="w-full flex flex-col justify-center items-center gap-7 sm:w-[60%] z-10">
					<div className="text-3xl text-gray-800">LOGIN</div>
					{error && <p className="text-red-500">{error}</p>}
					<div className="relative w-full">
						<label htmlFor="email" className="sr-only">Email</label>
						<input id="email" type="email" placeholder="Enter Email" value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-300" required />
					</div>
					<div className="relative w-full">
						<label htmlFor="password" className="sr-only">Password</label>
						<input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter Password" value={password} onChange={(e)=>setPassword(e.target.value)} className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 pr-20 focus:outline-none focus:ring-2 focus:ring-emerald-300" required />
						<button type="button" className="absolute inset-y-0 right-3 text-sm text-emerald-700" onClick={()=>setShowPassword(!showPassword)}>
							{showPassword ? 'Hide' : 'Show'}
						</button>
					</div>
					<button type="submit" disabled={isLoading} className={`w-full bg-emerald-700 text-white font-semibold py-3 rounded-xl shadow-md hover:bg-emerald-800 transition ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
						{isLoading ? 'Logging in...' : 'Log In'}
					</button>
					<div className="text-center mt-2">
						<p className="text-sm text-gray-600">Don't have an account?
							<button type="button" className="text-emerald-700 hover:underline font-medium ml-1" onClick={()=>navigate('/signup')}>Sign up</button>
						</p>
					</div>
				</form>
			</div>
			<div className="w-0 relative sm:w-1/2 flex flex-col justify-center overflow-hidden"></div>
		</div>
	)
}

