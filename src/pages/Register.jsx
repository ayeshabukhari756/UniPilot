import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { apiFetch } from "../api"
import "./Register.css"

function Register() {
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  function getPasswordStrength(password) {
    if (!password) {
      return {
        label: "",
        score: 0,
      }
    }

    let score = 0

    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    if (score <= 2) {
      return {
        label: "Weak",
        score: 1,
      }
    }

    if (score <= 3) {
      return {
        label: "Medium",
        score: 2,
      }
    }

    return {
      label: "Strong",
      score: 3,
    }
  }

  const passwordStrength = getPasswordStrength(password)

  function generatePassword() {
    const suggestedPassword =
      "UniPilot@" +
      Math.floor(1000 + Math.random() * 9000)

    setPassword(suggestedPassword)
    setShowPassword(true)
  }

  async function handleRegister(e) {
    e.preventDefault()

    setError("")

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields.")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    try {
      setLoading(true)

      const response = await apiFetch(
        "/api/auth/register",
        {
          method: "POST",
          auth: false,
          body: JSON.stringify({
            name: `${firstName} ${lastName}`,
            email,
            password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Registration failed.")
        return
      }

      alert("Account created successfully!")

      navigate("/login")
    } catch (error) {
      console.error("Registration error:", error)

      setError(
        "Unable to connect to the server. Make sure the backend is running."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">

      <div className="register-card">

        <div className="register-brand">

          <div className="register-logo">
            UniPilot
          </div>

          <p>
            Your university companion
          </p>

        </div>


        <div className="register-heading">

          <h1>
            Create your account.
          </h1>

          <p>
            Start organizing your university journey with UniPilot.
          </p>

        </div>


        <form
          className="register-form"
          onSubmit={handleRegister}
        >

          <div className="form-row">

            <div className="form-group">

              <label htmlFor="firstName">
                First Name
              </label>

              <input
                type="text"
                id="firstName"
                placeholder="Ayesha"
                value={firstName}
                onChange={(e) =>
                  setFirstName(e.target.value)
                }
              />

            </div>


            <div className="form-group">

              <label htmlFor="lastName">
                Last Name
              </label>

              <input
                type="text"
                id="lastName"
                placeholder="Bukhari"
                value={lastName}
                onChange={(e) =>
                  setLastName(e.target.value)
                }
              />

            </div>

          </div>


          <div className="form-group">

            <label htmlFor="registerEmail">
              University Email
            </label>

            <input
              type="email"
              id="registerEmail"
              placeholder="you@example.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

          </div>


          {/* PASSWORD */}

          <div className="form-group">

            <label htmlFor="registerPassword">
              Password
            </label>

            <div className="password-input-wrapper">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                id="registerPassword"
                placeholder="Create a password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
              />

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
                {showPassword ? "◉" : "◌"}
              </button>

            </div>


            {password && (
              <div className="password-strength">

                <div className="strength-bars">

                  <span
                    className={
                      passwordStrength.score >= 1
                        ? "filled"
                        : ""
                    }
                  />

                  <span
                    className={
                      passwordStrength.score >= 2
                        ? "filled"
                        : ""
                    }
                  />

                  <span
                    className={
                      passwordStrength.score >= 3
                        ? "filled"
                        : ""
                    }
                  />

                </div>

                <span
                  className={`strength-text strength-${passwordStrength.label.toLowerCase()}`}
                >
                  {passwordStrength.label}
                </span>

              </div>
            )}


            <div className="password-suggestion">

              <span>
                Use 8+ characters with numbers and symbols.
              </span>

              <button
                type="button"
                onClick={generatePassword}
              >
                Suggest strong password
              </button>

            </div>

          </div>


          {/* CONFIRM PASSWORD */}

          <div className="form-group">

            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <div className="password-input-wrapper">

              <input
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                id="confirmPassword"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) =>
                  setConfirmPassword(e.target.value)
                }
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    !showConfirmPassword
                  )
                }
                aria-label={
                  showConfirmPassword
                    ? "Hide password"
                    : "Show password"
                }
              >
                {showConfirmPassword ? "◉" : "◌"}
              </button>

            </div>

          </div>


          {error && (
            <p
              className="register-error"
            >
              {error}
            </p>
          )}


          <button
            type="submit"
            className="register-button"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account →"}
          </button>

        </form>


        <p className="login-text">

          Already have an account?{" "}

          <Link to="/login">
            Log in
          </Link>

        </p>

      </div>

    </div>
  )
}

export default Register