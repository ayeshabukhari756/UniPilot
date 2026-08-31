import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "./Dashboard.css"

const API = "http://localhost:5000"

function Dashboard() {
  const navigate = useNavigate()

  const studyTips = [
    "Small, consistent study sessions are more effective than last-minute cramming.",
    "Focus on understanding the concept, not just memorizing the answer.",
    "A little progress every day can take you much further than occasional long study sessions.",
    "Take short breaks while studying to keep your mind focused and fresh.",
    "Start with the task that feels hardest. Finishing it can make the rest of your study session easier.",
    "Your future self will thank you for the work you do today.",
    "Don't aim for perfect study sessions. Aim for steady progress.",
  ]

  const [studyTip, setStudyTip] = useState("")

  const [timetable, setTimetable] = useState([])
  const [assignments, setAssignments] = useState([])
  const [exams, setExams] = useState([])
  const [studySessions, setStudySessions] = useState([])
  const [careerGoals, setCareerGoals] = useState([])
  const [notifications, setNotifications] = useState([])
  const [analytics, setAnalytics] = useState(null)

  const [user, setUser] = useState(null)
  const [accountOpen, setAccountOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user")

      if (savedUser) {
        setUser(JSON.parse(savedUser))
      }
    } catch (error) {
      console.error("User loading error:", error)
    }
  }, [])

  function getAuthHeaders() {
    const token = localStorage.getItem("token")

    return {
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
    }
  }

  useEffect(() => {
    async function loadDashboard() {
      try {
        const authHeaders = getAuthHeaders()

        const [
          timetableResponse,
          assignmentsResponse,
          examsResponse,
          studyResponse,
          goalsResponse,
          notificationsResponse,
          analyticsResponse,
        ] = await Promise.all([
          fetch(`${API}/api/timetable`, { headers: authHeaders }),
          fetch(`${API}/api/assignments`, { headers: authHeaders }),
          fetch(`${API}/api/exams`, { headers: authHeaders }),
          fetch(`${API}/api/study-sessions`, { headers: authHeaders }),
          fetch(`${API}/api/career-goals`, { headers: authHeaders }),
          fetch(`${API}/api/notifications`, { headers: authHeaders }),
          fetch(`${API}/api/analytics`, { headers: authHeaders }),
        ])

        if (timetableResponse.ok) {
          const data = await timetableResponse.json()
          setTimetable(Array.isArray(data) ? data : [])
        }

        if (assignmentsResponse.ok) {
          const data = await assignmentsResponse.json()
          setAssignments(Array.isArray(data) ? data : [])
        }

        if (examsResponse.ok) {
          const data = await examsResponse.json()
          setExams(Array.isArray(data) ? data : [])
        }

        if (studyResponse.ok) {
          const data = await studyResponse.json()
          setStudySessions(Array.isArray(data) ? data : [])
        }

        if (goalsResponse.ok) {
          const data = await goalsResponse.json()
          setCareerGoals(Array.isArray(data) ? data : [])
        }

        if (notificationsResponse.ok) {
          const data = await notificationsResponse.json()
          setNotifications(Array.isArray(data) ? data : [])
        }

        if (analyticsResponse.ok) {
          const data = await analyticsResponse.json()

          if (
            data &&
            typeof data === "object" &&
            !Array.isArray(data) &&
            data.assignments &&
            data.study
          ) {
            setAnalytics(data)
          }
        }
      } catch (error) {
        console.error("Dashboard data loading error:", error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  useEffect(() => {
    const randomTip =
      studyTips[Math.floor(Math.random() * studyTips.length)]

    setStudyTip(randomTip)
  }, [])

  function handleLogout() {
    localStorage.removeItem("token")
    localStorage.removeItem("user")

    navigate("/login")
  }

  const today = new Date()

  const todayName = today.toLocaleDateString("en-US", {
    weekday: "long",
  })

  const fullDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  const todaysClasses = timetable.filter(
    (item) => item.day === todayName
  )

  const pendingAssignments = assignments.filter(
    (assignment) => !assignment.completed
  )

  const upcomingAssignments = [...pendingAssignments]
    .sort(
      (a, b) =>
        new Date(a.dueDate) - new Date(b.dueDate)
    )
    .slice(0, 3)

  const upcomingExams = [...exams]
    .filter(
      (exam) =>
        new Date(exam.date) >= today
    )
    .sort(
      (a, b) =>
        new Date(a.date) - new Date(b.date)
    )

  const studyProgress =
    analytics?.study?.progress || 0

  const unreadNotifications =
    notifications.filter(
      (notification) => !notification.read
    ).length

  const pendingTasks =
    (analytics?.assignments?.pending || 0) +
    (analytics?.study?.pending || 0)

  const activeGoals = careerGoals.length

  function getDaysRemaining(date) {
    const deadline = new Date(date)

    const difference =
      deadline.getTime() -
      today.getTime()

    const days = Math.ceil(
      difference /
        (1000 * 60 * 60 * 24)
    )

    if (days < 0) {
      return "Overdue"
    }

    if (days === 0) {
      return "Today"
    }

    if (days === 1) {
      return "1 day"
    }

    return `${days} days`
  }

  function formatTime(time) {
    if (!time) {
      return ""
    }

    const [hour, minute] = time.split(":")

    const date = new Date()

    date.setHours(
      Number(hour),
      Number(minute),
      0
    )

    return date.toLocaleTimeString(
      "en-US",
      {
        hour: "numeric",
        minute: "2-digit",
      }
    )
  }

  return (
    <div className="dashboard">

      <header className="dashboard-header">

        <div>
          <p className="dashboard-label">
            UNIPILOT / DASHBOARD
          </p>

          <h1>
            Good{" "}
            {today.getHours() < 12
              ? "morning"
              : today.getHours() < 18
              ? "afternoon"
              : "evening"}
            {user?.name
              ? `, ${user.name.split(" ")[0]}`
              : ""}
            .
          </h1>

          <p className="dashboard-subtitle">
            Here's what's happening with your
            university journey today.
          </p>
        </div>

        <div className="profile-area">

          <button
            className="notification"
            onClick={() =>
              navigate("/notifications")
            }
            title="Notifications"
          >
            🔔

            {unreadNotifications > 0 && (
              <span className="notification-badge">
                {unreadNotifications}
              </span>
            )}
          </button>

          <div className="account-wrapper">

            <button
              className="profile-button"
              onClick={() =>
                setAccountOpen(!accountOpen)
              }
            >

              <div className="profile-avatar">
                {user?.name
                  ? user.name
                      .charAt(0)
                      .toUpperCase()
                  : "A"}
              </div>

              <div className="profile-info">

                <strong>
                  {user?.name || "Ayesha"}
                </strong>

                <span>
                  Account
                </span>

              </div>

              <span className="account-arrow">
                {accountOpen ? "▲" : "▼"}
              </span>

            </button>

            {accountOpen && (
              <div className="account-menu">

                <div className="account-menu-user">

                  <strong>
                    {user?.name || "Ayesha"}
                  </strong>

                  <span>
                    {user?.email ||
                      "UniPilot Student"}
                  </span>

                </div>

                <div className="account-divider" />

                <Link
                  to="/notifications"
                  onClick={() =>
                    setAccountOpen(false)
                  }
                >
                  🔔 Notifications
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="account-logout"
                >
                  ↪ Logout
                </button>

              </div>
            )}

          </div>

        </div>

      </header>

      <section className="today-section">

        <div>

          <p className="section-label">
            TODAY
          </p>

          <h2>
            {fullDate}
          </h2>

          <p className="today-meta">

            {todaysClasses.length}{" "}
            {todaysClasses.length === 1
              ? "class"
              : "classes"}

            <span>•</span>

            {pendingAssignments.length}{" "}
            pending{" "}
            {pendingAssignments.length === 1
              ? "deadline"
              : "deadlines"}

          </p>

        </div>

        <div className="progress-area">

          <div className="progress-top">

            <span>
              Study progress
            </span>

            <strong>
              {studyProgress}%
            </strong>

          </div>

          <div className="progress-line">

            <div
              className="progress-value"
              style={{
                width: `${studyProgress}%`,
              }}
            />

          </div>

        </div>

      </section>

      <section className="stats">

        <div className="stat">

          <span>
            Pending tasks
          </span>

          <strong>
            {String(pendingTasks).padStart(
              2,
              "0"
            )}
          </strong>

        </div>

        <div className="stat">

          <span>
            Upcoming exams
          </span>

          <strong>
            {String(
              upcomingExams.length
            ).padStart(2, "0")}
          </strong>

        </div>

        <div className="stat">

          <span>
            Career goals
          </span>

          <strong>
            {String(
              activeGoals
            ).padStart(2, "0")}
          </strong>

        </div>

      </section>

      <section className="learning-tip">

        <div className="tip-heading">

          <p className="section-label">
            DAILY LEARNING
          </p>

        </div>

        <h2>
          A small reminder for today.
        </h2>

        <p>
          {studyTip}
        </p>

      </section>

      <section className="dashboard-grid">

        <div className="dashboard-section">

          <div className="section-heading">

            <div>

              <p className="section-label">
                SCHEDULE
              </p>

              <h2>
                Today's classes
              </h2>

            </div>

            <Link to="/timetable">
              View timetable →
            </Link>

          </div>

          <div className="class-list">

            {loading ? (

              <p className="dashboard-empty">
                Loading timetable...
              </p>

            ) : todaysClasses.length === 0 ? (

              <p className="dashboard-empty">
                No classes scheduled for today.
              </p>

            ) : (

              todaysClasses
                .slice(0, 3)
                .map((classItem) => (

                  <div
                    className="class-row"
                    key={classItem.id}
                  >

                    <div className="class-time">

                      <strong>
                        {formatTime(
                          classItem.startTime
                        )}
                      </strong>

                    </div>

                    <div className="class-details">

                      <h3>
                        {classItem.subject}
                      </h3>

                      <p>
                        {classItem.room
                          ? `Room ${classItem.room} · `
                          : ""}

                        {formatTime(
                          classItem.startTime
                        )}{" "}
                        –{" "}
                        {formatTime(
                          classItem.endTime
                        )}
                      </p>

                    </div>

                    <span className="status">
                      Upcoming
                    </span>

                  </div>

                ))

            )}

          </div>

        </div>

        <div className="dashboard-section">

          <div className="section-heading">

            <div>

              <p className="section-label">
                DEADLINES
              </p>

              <h2>
                Coming up
              </h2>

            </div>

            <Link to="/assignments">
              View all →
            </Link>

          </div>

          <div className="deadline-list">

            {loading ? (

              <p className="dashboard-empty">
                Loading assignments...
              </p>

            ) : upcomingAssignments.length === 0 ? (

              <p className="dashboard-empty">
                No pending assignments.
              </p>

            ) : (

              upcomingAssignments.map(
                (assignment, index) => (

                  <div
                    className="deadline-row"
                    key={assignment.id}
                  >

                    <div className="deadline-number">
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </div>

                    <div className="deadline-info">

                      <h3>
                        {assignment.title}
                      </h3>

                      <p>
                        {assignment.subject}
                      </p>

                    </div>

                    <span
                      className={
                        getDaysRemaining(
                          assignment.dueDate
                        ) === "Overdue"
                          ? "urgent"
                          : ""
                      }
                    >
                      {getDaysRemaining(
                        assignment.dueDate
                      )}
                    </span>

                  </div>

                )
              )

            )}

          </div>

        </div>

      </section>

      <section className="dashboard-overview">

        <div className="overview-card">

          <p className="section-label">
            EXAMS
          </p>

          <h3>
            {upcomingExams.length}
          </h3>

          <p>
            Upcoming exams
          </p>

          <Link to="/exams">
            View exams →
          </Link>

        </div>

        <div className="overview-card">

          <p className="section-label">
            STUDY PLANNER
          </p>

          <h3>
            {analytics?.study?.totalMinutes || 0}
          </h3>

          <p>
            Study minutes planned
          </p>

          <Link to="/study-planner">
            View planner →
          </Link>

        </div>

        <div className="overview-card">

          <p className="section-label">
            CAREER
          </p>

          <h3>
            {activeGoals}
          </h3>

          <p>
            Active career goals
          </p>

          <Link to="/career-goals">
            View goals →
          </Link>

        </div>

        <div className="overview-card">

          <p className="section-label">
            NOTIFICATIONS
          </p>

          <h3>
            {unreadNotifications}
          </h3>

          <p>
            Unread notifications
          </p>

          <Link to="/notifications">
            View notifications →
          </Link>

        </div>

      </section>

      {loading && (
        <p className="dashboard-loading">
          Connecting UniPilot data...
        </p>
      )}

    </div>
  )
}

export default Dashboard