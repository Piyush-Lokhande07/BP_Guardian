import React from 'react'
import { Link } from 'react-router-dom'

export default function Login() {
	return (
		<main className="page-login">
			<h2>Login</h2>
			<p>
				Placeholder login page. Go to <Link to="/signup">Sign Up</Link> to create an account.
			</p>
		</main>
	)
}
