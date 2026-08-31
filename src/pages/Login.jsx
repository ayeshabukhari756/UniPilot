import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { apiFetch } from "../api"
import "./Login.css"

function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()

    setError("")

    if (!email || !password) {
      setError("Please enter your email and password.")
      return
    }

    try {
      setLoading(true)

      const response = await apiFetch(
        "/api/auth/login",
        {
          method: "POST",
          auth: false,
          body: JSON.stringify({
            email,
            password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Invalid email or password.")
        return
      }

      // Save JWT token
      localStorage.setItem("token", data.token)

      // Save logged-in user
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      )

      navigate("/dashboard")
    } catch (error) {
      console.error("Login error:", error)

      setError(
        "Unable to connect to the server. Make sure the backend is running."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">

      <div className="login-card">

        {/* BRAND */}

        <div className="login-brand">

          <Link to="/" className="login-logo">
            UniPilot
          </Link>

          <p>
            Your university companion
          </p>

        </div>


        {/* HEADING */}

        <div className="login-heading">

          <h1>
            Welcome back.
          </h1>

          <p>
            Log in to continue your university journey.
          </p>

        </div>


        {/* FORM */}

        <form
          className="login-form"
          onSubmit={handleLogin}
        >

          {/* EMAIL */}

          <div className="form-group">

            <label htmlFor="email">
              University Email
            </label>

            <input
              type="email"
              id="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

          </div>


          {/* PASSWORD */}

          <div className="form-group">

            <div className="password-label">

              <label htmlFor="password">
                Password
              </label>

              <a href="#">
                Forgot password?
              </a>

            </div>


            {/* PASSWORD INPUT */}

            <div className="password-input-wrapper">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                id="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />


              {/* EYE BUTTON */}

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(!showPassword)
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >

                {showPassword ? (

                  /* EYE OFF */

                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />

                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c5 0 8.27 4.11 9 7-.24 1-.91 2.17-1.88 3.16" />

                    <path d="M6.61 6.61C4.62 7.9 3.29 10.03 3 12c.73 2.89 4 7 9 7a10.5 10.5 0 0 0 5.39-1.61" />

                    <line
                      x1="3"
                      y1="3"
                      x2="21"
                      y2="21"
                    />
                  </svg>

                ) : (

                  /* EYE */

                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M2.06 12.35a1 1 0 0 1 0-.7C3.77 7.61 7.65 5 12 5s8.23 2.61 9.94 6.65a1 1 0 0 1 0 .7C20.23 16.39 16.35 19 12 19s-8.23-2.61-9.94-6.65Z" />

                    <circle
                      cx="12"
                      cy="12"
                      r="3"
                    />
                  </svg>

                )}

              </button>

            </div>

          </div>


          {/* ERROR */}

          {error && (
            <p
              style={{
                color: "#c0392b",
                fontSize: "13px",
                margin: "-5px 0 0",
              }}
            >
              {error}
            </p>
          )}


          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "Log In →"}
          </button>

        </form>


        {/* REGISTER */}

        <p className="register-text">

          Don't have an account?{" "}

          <Link to="/register">
            Create one
          </Link>

        </p>


        {/* BACK HOME */}

        <Link
          to="/"
          className="back-home"
        >
          ← Back to home
        </Link>

      </div>

    </div>
  )
}

export default Login