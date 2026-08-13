import { useEffect, useState } from "react"

import Login from "./components/login"
import Signup from "./components/signup"
import Dashboard from "./components/Dashboard"
import { authenticatedFetch } from "./api"
import "./App.css"

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [showLogin, setShowLogin] = useState(true)

  useEffect(() => {
    async function checkSession() {
      const accessToken = localStorage.getItem("access_token")
      const refreshToken = localStorage.getItem("refresh_token")

      if (!accessToken || !refreshToken) {
        setIsCheckingSession(false)
        return
      }

      const response = await authenticatedFetch(
        "http://127.0.0.1:8000/auth/me"
      )

      if (response.ok) {
        setIsLoggedIn(true)
      } else {
        localStorage.removeItem("access_token")
        localStorage.removeItem("refresh_token")
        setIsLoggedIn(false)
      }

      setIsCheckingSession(false)
    }

    checkSession()
  }, [])

  function handleLogout() {
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")

    setIsLoggedIn(false)
    setShowLogin(true)
  }

  function handleSignupSuccess() {
    setShowLogin(true)
  }

  if (isCheckingSession) {
    return (
      <div>
        <h1>Task Manager</h1>
        <p>Checking session...</p>
      </div>
    )
  }

  if (isLoggedIn) {
    return (
      <div>
        <h1>Task Manager</h1>

        <Dashboard onLogout={handleLogout} />
      </div>
    )
  }

  return (
    <div>
      <h1>Task Manager</h1>

      {showLogin ? (
        <Login
          onLogin={() => setIsLoggedIn(true)}
        />
      ) : (
        <Signup
          onSignupSuccess={handleSignupSuccess}
        />
      )}

      <button
        onClick={() => setShowLogin(!showLogin)}
      >
        {showLogin
          ? "Create an account"
          : "Back to login"}
      </button>
    </div>
  )
}

export default App