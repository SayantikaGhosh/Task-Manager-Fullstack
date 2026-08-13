import { useState } from "react"
import { API_URL } from "../api"

type SignupProps = {
  onSignupSuccess: () => void
}

function Signup({ onSignupSuccess }: SignupProps) {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleSignup() {
    setMessage("")
    setError("")

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters long.")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(
        `${API_URL}/auth/signup`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username,
            email: email,
            password: password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        if (Array.isArray(data.detail)) {
          setError(
            data.detail
              .map((item: { msg: string }) => item.msg)
              .join(", ")
          )
        } else {
          setError(
            data.detail || "Signup failed. Please try again."
          )
        }

        return
      }

      setMessage(
        "Account created successfully! Redirecting to login..."
      )

      setUsername("")
      setEmail("")
      setPassword("")

      setTimeout(() => {
        onSignupSuccess()
      }, 1000)
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
      <h2>Signup</h2>

      {message && (
        <p>
          {message}
        </p>
      )}

      {error && (
        <p>
          {error}
        </p>
      )}

      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(event) =>
          setUsername(event.target.value)
        }
      />

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

      <p>
        Password must be at least 8 characters.
      </p>

      <button
        onClick={handleSignup}
        disabled={isLoading}
      >
        {isLoading ? "Creating account..." : "Signup"}
      </button>
    </div>
  )
}

export default Signup