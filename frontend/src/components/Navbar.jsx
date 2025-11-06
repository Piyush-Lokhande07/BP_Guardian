import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Menu, X } from 'lucide-react'

export default function Navbar() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	return (
		<motion.nav
			className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100"
			initial={{ y: -100 }}
			animate={{ y: 0 }}
			transition={{ duration: 0.5 }}
		>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Logo */}
					<motion.div className="flex items-center gap-2" whileHover={{ scale: 1.05 }}>
						<div className="w-8 h-8 bg-linear-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
							<Heart className="w-5 h-5 text-white" />
						</div>
						<span className="font-bold text-xl text-slate-900">MediBridge</span>
					</motion.div>

					{/* Desktop Menu */}
					<div className="hidden md:flex items-center gap-8">
						{["Home", "Features", "AI Insights", "For Doctors", "Contact"].map((item) => (
							<motion.a
								key={item}
								href={`#${item.toLowerCase()}`}
								className="text-slate-600 hover:text-blue-600 transition-colors text-sm font-medium"
								whileHover={{ y: -2 }}
							>
								{item}
							</motion.a>
						))}
					</div>

					{/* Get Started Button (Desktop) */}
					<motion.button
						className="hidden md:flex px-6 py-2 bg-linear-to-r from-blue-500 to-teal-500 text-white rounded-full font-medium text-sm hover:shadow-lg transition-shadow"
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						Get Started
					</motion.button>

					{/* Mobile Menu Toggle */}
					<button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
						{mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
					</button>
				</div>

				{/* Mobile Menu */}
				{mobileMenuOpen && (
					<motion.div
						className="md:hidden pb-4 border-t border-slate-100"
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: 'auto' }}
						exit={{ opacity: 0, height: 0 }}
					>
						{["Home", "Features", "AI Insights", "For Doctors", "Contact"].map((item) => (
							<a
								key={item}
								href={`#${item.toLowerCase()}`}
								className="block py-2 text-slate-600 hover:text-blue-600 text-sm font-medium"
								onClick={() => setMobileMenuOpen(false)}
							>
								{item}
							</a>
						))}
						<button className="w-full mt-4 px-6 py-2 bg-linear-to-r from-blue-500 to-teal-500 text-white rounded-full font-medium text-sm">
							Get Started
						</button>
					</motion.div>
				)}
			</div>
		</motion.nav>
	)
}

