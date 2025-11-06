import React from 'react'
import { Link, NavLink } from 'react-router-dom'

export default function Navbar() {
	return (
		<nav className="w-full bg-white/95 backdrop-blur border-b border-slate-200" aria-label="Main navigation">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="h-16 flex items-center gap-6">
					<Link to="/" className="text-2xl font-semibold text-slate-800 tracking-tight">
						medicus<span className="text-slate-400">.ai</span>
					</Link>

					<ul className="hidden md:flex items-center gap-8 text-slate-700 ml-6">
						<li>
							<NavLink
								to="/"
								className={({ isActive }) => `relative pb-2 transition-colors ${isActive ? 'text-teal-500' : 'hover:text-slate-900'}`}
							>
								Home
								{/** underline for active */}
								<span className="absolute left-0 -bottom-0.5 h-0.5 w-full rounded bg-teal-400 scale-x-100" hidden={!window.location.pathname.startsWith('/')}></span>
							</NavLink>
						</li>
						<li>
							<Link className="hover:text-slate-900 flex items-center" to="/enterprise">
								Enterprise <span className="ml-1 text-slate-400">▾</span>
							</Link>
						</li>
						<li>
							<Link className="hover:text-slate-900 flex items-center" to="/products">
								Products <span className="ml-1 text-slate-400">▾</span>
							</Link>
						</li>
						<li><Link className="hover:text-slate-900" to="/about">About</Link></li>
						<li><Link className="hover:text-slate-900" to="/blog">Blog</Link></li>
						<li>
							<Link className="hover:text-slate-900 flex items-center" to="/careers">
								Careers <span className="ml-1 text-slate-400">▾</span>
							</Link>
						</li>
					</ul>

					<div className="flex items-center gap-6 ml-auto">
						<Link to="/free-trial" className="px-6 py-2 rounded-full bg-teal-400 text-white font-semibold shadow hover:bg-teal-500">
							Free Trial
						</Link>
						<span className="text-slate-700">EN</span>
					</div>
				</div>
			</div>
		</nav>
	)
}

