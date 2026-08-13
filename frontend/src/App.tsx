import { useState } from "react"

import Login from "./components/login"
import Signup from "./components/signup"
import Dashboard from "./components/Dashboard"
import "./App.css"
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("access_token"))
  )

  const [showLogin, setShowLogin] = useState(true)

  if (isLoggedIn) {
    return (
      <div>
        <h1>Task Manager</h1>

       <Dashboard onLogout={handleLogout} />
      </div>
    )
  }

  function handleLogout() {
  localStorage.removeItem("access_token")
  setIsLoggedIn(false)
  }

  return (
    <div>
      <h1>Task Manager</h1>

      {showLogin ? (
        <Login
          onLogin={() => setIsLoggedIn(true)}
        />
      ) : (
        <Signup />
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