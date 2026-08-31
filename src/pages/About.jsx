import "./About.css";
import { Link } from "react-router-dom";

function About() {
  return (
    <div className="about-page">

      {/* =========================================
          NAVBAR
      ========================================= */}

      <nav className="about-navbar">

        <Link to="/" className="about-logo">
          UniPilot
        </Link>

        <div className="about-nav-links">

          <Link to="/">
            Home
          </Link>

          <Link to="/features">
            Features
          </Link>

          <Link to="/about" className="active">
            About
          </Link>

          <Link to="/login">
            Login
          </Link>

          <Link to="/login" className="about-nav-button">
            Get Started
          </Link>

        </div>

      </nav>


      {/* =========================================
          ABOUT CONTENT
      ========================================= */}

      <main className="about-content">

        <p className="about-label">
          ABOUT UNIPILOT
        </p>

        <h1>
          A little about UniPilot.
        </h1>


        {/* ABOUT DESCRIPTION */}

        <div className="about-box">

          <div className="about-box-icon">
            🎓
          </div>

          <p>
            UniPilot is a university companion created to help
            students organize their academic responsibilities,
            manage their time, develop useful skills, and keep
            their career goals in sight. University life often
            means balancing classes, assignments, exams, learning,
            and future planning all at once. UniPilot brings these
            important parts together in one simple workspace,
            helping students stay organized, focused, and more
            confident throughout their university journey.
          </p>

        </div>


        {/* WHY UNIPILOT */}

        <div className="why-section">

          <p className="about-label">
            WHY UNIPILOT?
          </p>

          <p className="why-text">
            Because university is more than classes and
            assignments. It's also about discovering your
            strengths, building skills, and preparing for
            what's next.
          </p>

        </div>


        {/* VALUES */}

        <div className="about-bottom">

          <span>
            📚 Learn
          </span>

          <span>
            🌱 Grow
          </span>

          <span>
            🎯 Achieve
          </span>

        </div>

      </main>

    </div>
  );
}

export default About;