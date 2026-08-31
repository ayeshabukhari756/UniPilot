import { NavLink, Outlet, Link } from "react-router-dom"
import "./DashboardLayout.css"

function DashboardLayout() {
  return (
    <div className="dashboard-layout">

      {/* SIDEBAR */}

      <aside className="sidebar">

        {/* LOGO */}

        <Link to="/dashboard" className="dashboard-logo">
          UniPilot
        </Link>


        {/* HOME */}

        <nav className="sidebar-nav">

          <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              isActive ? "active home-link" : "home-link"
            }
          >
            <span className="nav-icon">🏠</span>
            Home
          </NavLink>


          {/* OVERVIEW */}

          <p className="nav-label">OVERVIEW</p>

          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <span className="nav-icon">📊</span>
            Analytics
          </NavLink>


          {/* UNIVERSITY */}

          <p className="nav-label">UNIVERSITY</p>

          <NavLink
            to="/timetable"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <span className="nav-icon">📅</span>
            Timetable
          </NavLink>

          <NavLink
            to="/assignments"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <span className="nav-icon">📝</span>
            Assignments
          </NavLink>

          <NavLink
            to="/exams"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <span className="nav-icon">🧪</span>
            Exams
          </NavLink>

          <NavLink
            to="/study-planner"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <span className="nav-icon">📚</span>
            Study Planner
          </NavLink>


          {/* GROWTH */}

          <p className="nav-label">GROWTH</p>

          <NavLink
            to="/skill-roadmap"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <span className="nav-icon">🌱</span>
            Skill Roadmap
          </NavLink>

          <NavLink
            to="/career-goals"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <span className="nav-icon">🎯</span>
            Career Goals
          </NavLink>

          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              isActive ? "active" : ""
            }
          >
            <span className="nav-icon">🔔</span>
            Notifications
          </NavLink>

        </nav>

      </aside>


      {/* PAGE CONTENT */}

      <main className="dashboard-main">
        <Outlet />
      </main>

    </div>
  )
}

export default DashboardLayout