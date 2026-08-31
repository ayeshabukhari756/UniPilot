import "./App.css"
import { Link } from "react-router-dom"
import heroImage from "./assets/unipilot-hero.png"

function App() {
  return (
    <div className="app">

      {/* NAVBAR */}

      <nav className="navbar">

        <Link to="/" className="logo">
          UniPilot
        </Link>

        <div className="nav-links">

          <Link to="/">
            Home
          </Link>

          <Link to="/features">
            Features
          </Link>

          <Link to="/about">
            About
          </Link>

          <Link to="/login">
            Login
          </Link>

          <Link to="/register" className="nav-button">
            Get Started
          </Link>

        </div>

      </nav>


      {/* HERO */}

      <main className="hero">

        <div className="hero-text">

          <p className="small-heading">
            YOUR UNIVERSITY COMPANION
          </p>

          <h1>
            Your journey
            <br />
            starts here.
          </h1>

          <p className="description">
            Plan your days. Track your progress. Build your future.
          </p>

          <Link to="/register" className="start-button">
            Get Started →
          </Link>

        </div>


        <img
          src={heroImage}
          alt="UniPilot student journey"
          className="hero-background-image"
        />

        <div className="hero-overlay"></div>

      </main>


      {/* FEATURES */}

      <section className="features">

        <div className="section-heading">

          <p className="section-label">
            YOUR UNIVERSITY, ORGANIZED
          </p>

          <h2>
            Everything you need for your journey.
          </h2>

          <p className="section-description">
            Stay organized, keep growing, and take control of your
            university life from one simple workspace.
          </p>

        </div>


        <div className="feature-grid">

          <Link to="/timetable" className="feature-card">

            <div className="feature-icon">
              📅
            </div>

            <h3>
              Timetable
            </h3>

            <p>
              Keep your classes, timings, rooms, and daily schedule
              organized in one place.
            </p>

          </Link>


          <Link to="/assignments" className="feature-card">

            <div className="feature-icon">
              📝
            </div>

            <h3>
              Assignments
            </h3>

            <p>
              Track assignments, deadlines, and academic tasks
              before they become last-minute problems.
            </p>

          </Link>


          <Link to="/study-planner" className="feature-card">

            <div className="feature-icon">
              📚
            </div>

            <h3>
              Study Planner
            </h3>

            <p>
              Plan focused study sessions and manage your
              available time more effectively.
            </p>

          </Link>


          <Link to="/exams" className="feature-card">

            <div className="feature-icon">
              🧪
            </div>

            <h3>
              Exams
            </h3>

            <p>
              Keep upcoming exams and preparation organized
              so important dates never get lost.
            </p>

          </Link>


          <Link to="/skill-roadmap" className="feature-card">

            <div className="feature-icon">
              🌱
            </div>

            <h3>
              Skill Roadmap
            </h3>

            <p>
              Track the technical and professional skills
              you are building for your future.
            </p>

          </Link>


          <Link to="/career-goals" className="feature-card">

            <div className="feature-icon">
              🎯
            </div>

            <h3>
              Career Goals
            </h3>

            <p>
              Set meaningful career goals and keep your
              future direction visible.
            </p>

          </Link>

        </div>

      </section>


      {/* HOW IT WORKS */}

      <section className="how-it-works">

        <div className="how-heading">

          <p className="section-label">
            HOW UNIPILOT WORKS
          </p>

          <h2>
            Everything starts with a plan.
          </h2>

          <p className="section-description">
            UniPilot helps you organize your university life,
            stay focused, and move confidently toward your goals.
          </p>

        </div>


        <div className="steps-container">

          <div className="step-card">

            <div className="step-number">
              01
            </div>

            <h3>
              Organize
            </h3>

            <p>
              Manage your timetable, assignments, exams,
              and important university tasks in one place.
            </p>

          </div>


          <div className="step-card">

            <div className="step-number">
              02
            </div>

            <h3>
              Plan
            </h3>

            <p>
              Create study plans, track your progress,
              and stay ahead of important deadlines.
            </p>

          </div>


          <div className="step-card">

            <div className="step-number">
              03
            </div>

            <h3>
              Grow
            </h3>

            <p>
              Build useful skills, set career goals,
              and create a clearer path toward your future.
            </p>

          </div>

        </div>

      </section>


      {/* CTA */}

      <section className="cta-section">

        <div className="cta-content">

          <p className="section-label">
            READY TO TAKE CONTROL?
          </p>

          <h2>
            Your university life,
            <br />
            all in one place.
          </h2>

          <p>
            From your first class to your career goals,
            UniPilot keeps everything organized so you can
            focus on what matters.
          </p>

          <Link
            to="/register"
            className="start-button light-button"
          >
            Get Started →
          </Link>

        </div>

      </section>



    </div>
  )
}

export default App