import { useState } from "react"

type LoginProps = {
  onLogin: () => void
}

function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  async function handleLogin() {
    const response = await fetch(
      "http://127.0.0.1:8000/auth/login",
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
    localStorage.setItem(
    "access_token",
    data.access_token
    )

    localStorage.setItem(
    "refresh_token",
    data.refresh_token
    )
    
    onLogin()
    console.log(data)
  }

  return (
    <div>
      <h2>Login</h2>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <button onClick={handleLogin}>
        Login
      </button>
    </div>
  )
}

export default Login