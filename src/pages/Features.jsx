import "./Features.css";
import { Link } from "react-router-dom";

function Features() {
  return (
    <div className="features-page">

      {/* =========================================
          NAVBAR
      ========================================= */}

      <nav className="features-navbar">

        <Link to="/" className="features-logo">
          UniPilot
        </Link>

        <div className="features-nav-links">

          <Link to="/">
            Home
          </Link>

          <Link to="/features" className="active">
            Features
          </Link>

          <Link to="/about">
            About
          </Link>

          <Link to="/login">
            Login
          </Link>

          <Link to="/login" className="features-nav-button">
            Get Started
          </Link>

        </div>

      </nav>


      {/* =========================================
          HERO
      ========================================= */}

      <section className="features-hero">

        <div className="features-hero-content">

          <p className="features-label">
            FEATURES
          </p>

          <h1>
            Everything you need
            <br />
            for your journey.
          </h1>

          <p className="features-intro">
            UniPilot brings your academic life, study planning,
            skill development, and career goals together in one
            simple workspace.
          </p>

        </div>


        {/* FEATURE ICONS */}

        <div className="feature-icon-row">

          <div className="feature-icon-item">
            <span>📅</span>
            <p>Classes</p>
          </div>

          <div className="feature-icon-item">
            <span>📝</span>
            <p>Tasks</p>
          </div>

          <div className="feature-icon-item">
            <span>📚</span>
            <p>Study</p>
          </div>

          <div className="feature-icon-item">
            <span>🧪</span>
            <p>Exams</p>
          </div>

          <div className="feature-icon-item">
            <span>🌱</span>
            <p>Skills</p>
          </div>

          <div className="feature-icon-item">
            <span>🎯</span>
            <p>Goals</p>
          </div>

        </div>

      </section>


      {/* =========================================
          MORE THAN JUST A PLANNER
      ========================================= */}

      <section className="more-section">

        <div className="more-heading">

          <p className="features-label">
            MORE THAN JUST A PLANNER
          </p>

          <h2>
            Built around your
            <br />
            complete journey.
          </h2>

          <p>
            UniPilot is designed to help you manage what matters
            today while keeping your bigger goals in sight.
          </p>

        </div>


        {/* HIGHLIGHT CARDS */}

        <div className="highlight-grid">

          <div className="highlight-card">

            <div className="highlight-icon">
              📋
            </div>

            <div className="highlight-number">
              01
            </div>

            <h3>
              Stay Organized
            </h3>

            <p>
              Keep your university responsibilities together
              instead of managing classes, tasks, and deadlines
              in different places.
            </p>

          </div>


          <div className="highlight-card">

            <div className="highlight-icon">
              📈
            </div>

            <div className="highlight-number">
              02
            </div>

            <h3>
              Track Progress
            </h3>

            <p>
              See how you're progressing through your academic
              work and the skills you're building along the way.
            </p>

          </div>


          <div className="highlight-card">

            <div className="highlight-icon">
              🚀
            </div>

            <div className="highlight-number">
              03
            </div>

            <h3>
              Build Your Future
            </h3>

            <p>
              Connect your learning and skill development with
              meaningful career goals for the future.
            </p>

          </div>

        </div>

      </section>


      {/* =========================================
          AI ASSISTANT
      ========================================= */}

      <section className="smart-section">

        <div className="smart-visual">

          <div className="smart-icon">
            🤖
          </div>

          <div className="ai-dots">

            <span></span>
            <span></span>
            <span></span>

          </div>

        </div>


        <div className="smart-content">

          <p className="features-label">
            AI ASSISTANT
          </p>

          <h2>
            A smarter way
            <br />
            to move forward.
          </h2>

          <p>
            UniPilot's AI Assistant will help make your
            university experience more personalized. It can
            provide guidance with tasks, study planning,
            skill development, and career goals based on
            your needs and priorities.
          </p>


          <div className="ai-features">

            <div className="ai-feature">

              <span>💡</span>

              <p>
                Smart Guidance
              </p>

            </div>


            <div className="ai-feature">

              <span>📚</span>

              <p>
                Study Support
              </p>

            </div>


            <div className="ai-feature">

              <span>🎯</span>

              <p>
                Goal Suggestions
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================
          CTA
      ========================================= */}

      <section className="features-cta">

        <div className="features-cta-content">

          <p className="features-label">
            READY TO GET STARTED?
          </p>

          <h2>
            Your journey.
            <br />
            One workspace.
          </h2>

          <p>
            Organize your present, build your skills,
            and prepare for your future with UniPilot.
          </p>

          <Link
            to="/login"
            className="features-start-button"
          >
            Get Started →
          </Link>

        </div>

      </section>


</div>
  );
}

export default Features;