import { useState } from "react"
import { API_URL } from "../api"

type LoginProps = {
  onLogin: () => void
}

function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleLogin() {
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
            password: password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(
          data.detail || "Invalid email or password."
        )

        return
      }

      localStorage.setItem(
        "access_token",
        data.access_token
      )

      localStorage.setItem(
        "refresh_token",
        data.refresh_token
      )

      onLogin()
    } catch {
      setError(
        "Unable to connect to the server. Please try again."
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h2>Login</h2>

      {error && (
        <p>
          {error}
        </p>
      )}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) =>
          setEmail(event.target.value)
        }
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) =>
          setPassword(event.target.value)
        }
      />

      <button
        onClick={handleLogin}
        disabled={isLoading}
      >
        {isLoading ? "Logging in..." : "Login"}
      </button>
    </div>
  )
}

export default Login