import React from 'react'

export default function Landing() {
	return (
		<main className="w-full">
			<section className="hero-section mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
				<div className="grid grid-cols-2 items-center gap-6 sm:gap-10 lg:gap-16">
					<div>
						<h1 className="hero-heading text-3xl sm:text-4xl lg:text-5xl">
							Empower your Patients
							<br/>with the Best
							<br/>Technology
						</h1>
						<div className="hero-accent-line mt-4"></div>
						<p className="hero-subtext mt-6 text-base sm:text-lg">
							Medicus AI is an innovative technology company that supports you by offering
							an AI-powered experience that takes your business to the next level and provides
							your patients with personalized access to better understand and manage their health.
						</p>
						<div className="mt-8">
							<a
								href="#contact"
								className="cta-btn"
							>
								Contact Us for Free Trial
							</a>
						</div>
					</div>
					<div className="relative">
						<div className="hero-illustration relative mx-auto w-full max-w-xl aspect-4/3">
							<div className="layer absolute inset-6 border border-sky-100 bg-white/60"></div>
							<div className="bubble right-6 top-6 h-24 w-24 bg-emerald-200/80"></div>
							<div className="bubble left-8 bottom-8 h-10 w-36 bg-sky-200/80"></div>
							<div className="bubble right-10 bottom-10 h-6 w-24 bg-indigo-200/80"></div>
						</div>
					</div>
				</div>
			</section>
		</main>
	)
}
