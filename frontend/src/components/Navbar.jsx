import React from 'react'
import { Link } from 'react-router-dom'

export default function Navbar() {
	return (
		<nav className="navbar" aria-label="Main navigation">
			<ul className="nav-list">
				<li className="nav-item">
					<Link to="/">Home</Link>
				</li>
				<li className="nav-item">
					<Link to="/features">Features</Link>
				</li>
				<li className="nav-item">
					<Link to="/patient-dashboard">Patient Dashboard</Link>
				</li>
				<li className="nav-item">
					<Link to="/doctor-dashboard">Doctor Dashboard</Link>
				</li>
				<li className="nav-item">
					<Link to="/bp-trends">BP Trends / Insights</Link>
				</li>
				<li className="nav-item">
					<Link to="/contact">Contact / Support</Link>
				</li>
				<li className="nav-item nav-auth">
					<Link to="/login">Login</Link>
				</li>
				<li className="nav-item nav-auth">
					<Link to="/signup">Sign Up</Link>
				</li>
			</ul>
		</nav>
	)
}

