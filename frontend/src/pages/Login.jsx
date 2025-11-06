import React from 'react'
import { Link } from 'react-router-dom'

export default function Login() {
	return (
		<main className="min-h-[calc(100vh-4rem)] w-full bg-emerald-200/80">
			<section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
				<div className="grid grid-cols-1 md:grid-cols-[1fr,420px] gap-0 rounded-2xl overflow-hidden bg-white/40">
					{/* Left Illustration / Content */}
					<div className="relative hidden md:block bg-linear-to-br from-emerald-100/70 via-emerald-200/70 to-emerald-300/60">
						<div className="absolute inset-0 pointer-events-none" style={{background:"radial-gradient(800px 400px at 70% 20%, rgba(16,185,129,0.15), transparent 60%)"}}></div>
						<div className="h-full w-full flex items-center justify-center py-16">
							<div className="relative w-[520px] max-w-full aspect-4/3 rounded-2xl bg-white/70 shadow-xl ring-1 ring-white/50">
								<div className="absolute -top-6 -left-6 h-16 w-24 rounded-xl bg-emerald-300/70"></div>
								<div className="absolute -bottom-6 right-10 h-20 w-36 rounded-xl bg-emerald-400/60"></div>
								<div className="absolute inset-6 rounded-xl border border-emerald-100"></div>
							</div>
						</div>
					</div>

					{/* Right Login Card */}
					<div className="bg-white md:rounded-l-none rounded-2xl md:rounded-r-2xl p-6 sm:p-8 shadow-xl ring-1 ring-slate-100">
						<h2 className="text-xl font-semibold text-slate-900">Welcome back!</h2>
						<p className="mt-1 text-sm text-slate-500">Please sign in to continue</p>

						<form className="mt-6 space-y-4">
							<div>
								<label className="block text-sm font-medium text-slate-700">Email</label>
								<input type="email" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="you@example.com"/>
							</div>
							<div>
								<label className="block text-sm font-medium text-slate-700">Password</label>
								<input type="password" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="••••••••"/>
							</div>
							<div className="flex items-center justify-between">
								<label className="inline-flex items-center gap-2 text-sm text-slate-600">
									<input type="checkbox" className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"/>
									Remember me
								</label>
								<Link to="#" className="text-sm text-emerald-600 hover:text-emerald-700">Forgot password?</Link>
							</div>
							<button type="button" className="mt-2 w-full rounded-full bg-emerald-600 px-4 py-2 text-white font-semibold shadow hover:bg-emerald-700">Login</button>
						</form>

						<div className="mt-6 text-sm text-center text-slate-600">
							New on our platform? <Link to="/signup" className="text-emerald-600 hover:text-emerald-700 font-medium">Create an account</Link>
							<div className="my-4 flex items-center gap-3">
								<div className="h-px flex-1 bg-slate-200"></div>
								<span className="text-slate-400">or</span>
								<div className="h-px flex-1 bg-slate-200"></div>
							</div>
							<div className="flex items-center justify-center gap-4 text-slate-500">
								<button type="button" aria-label="Login with Facebook" className="hover:text-slate-700">f</button>
								<button type="button" aria-label="Login with Twitter" className="hover:text-slate-700">t</button>
								<button type="button" aria-label="Login with GitHub" className="hover:text-slate-700">gh</button>
								<button type="button" aria-label="Login with Google" className="hover:text-slate-700">G</button>
							</div>
						</div>
					</div>
				</div>
			</section>
		</main>
	)
}
