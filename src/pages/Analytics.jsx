import { useEffect, useState } from "react"
import "./Analytics.css"

function Analytics() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const weekDays = [
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
  ]

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const token = localStorage.getItem("token")

        if (!token) {
          throw new Error("Please log in again.")
        }

        const response = await fetch(
          "http://localhost:5000/api/analytics",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await response.json().catch(() => ({}))

        if (!response.ok) {
          throw new Error(
            data.message || "Could not load analytics data."
          )
        }

        if (
          !data ||
          typeof data !== "object" ||
          Array.isArray(data) ||
          !data.assignments ||
          !data.study
        ) {
          throw new Error("Could not load analytics data.")
        }

        setAnalytics(data)
        setError("")
      } catch (loadError) {
        console.error("Analytics loading error:", loadError)

        setError(
          loadError.message ||
            "Unable to load analytics. Make sure the backend is running."
        )
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  const totalAssignments =
    Number(analytics?.assignments?.total) || 0

  const completedAssignments =
    Number(analytics?.assignments?.completed) || 0

  const assignmentCompletion =
    Number(analytics?.assignments?.progress) || 0

  const completedStudySessions =
    Number(analytics?.study?.completed) || 0

  const totalStudyMinutes =
    Number(analytics?.study?.totalMinutes) || 0

  const totalStudyHours =
    (totalStudyMinutes / 60).toFixed(1)

  const studyCompletion =
    Number(analytics?.study?.progress) || 0

  const totalStudySessions =
    Number(analytics?.study?.total) || 0

  const overallCompletion =
    Math.round(
      (assignmentCompletion + studyCompletion) / 2
    )

  const weeklyStudy =
    Array.isArray(analytics?.weeklyStudy)
      ? analytics.weeklyStudy
      : weekDays.map((day) => ({
          day,
          hours: 0,
        }))

  const calculatedMax = Math.max(
    ...weeklyStudy.map(
      (item) => Number(item?.hours) || 0
    ),
    1
  )

  const highestStudyDay = weeklyStudy.reduce(
    (highest, current) =>
      Number(current?.hours || 0) >
      Number(highest?.hours || 0)
        ? current
        : highest,
    weeklyStudy[0] || {
      day: "Mon",
      hours: 0,
    }
  )

  const examCount =
    Number(analytics?.exams?.total) || 0

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="empty-planner">
          <h2>Loading analytics...</h2>

          <p>
            Calculating your academic progress.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="analytics-page">

      {/* HEADER */}

      <div className="analytics-header">

        <div>

          <span className="analytics-eyebrow">
            YOUR PERFORMANCE
          </span>

          <h1>Analytics</h1>

          <p>
            Understand your study habits
            and track your academic progress.
          </p>

        </div>

        <select className="period-select">
          <option>This Week</option>
          <option>This Month</option>
          <option>This Semester</option>
        </select>

      </div>

      {/* ERROR */}

      {error && (
        <p
          style={{
            color: "#c0392b",
            fontSize: "13px",
            marginBottom: "20px",
          }}
        >
          {error}
        </p>
      )}

      {/* STATS */}

      <div className="stats-grid">

        <div className="stat-card">
          <span>Study Hours</span>

          <strong>
            {totalStudyHours}h
          </strong>

          <small>
            Total planned study time
          </small>
        </div>

        <div className="stat-card">
          <span>Assignments</span>

          <strong>
            {totalAssignments}
          </strong>

          <small>
            {completedAssignments} completed
          </small>
        </div>

        <div className="stat-card">
          <span>Study Sessions</span>

          <strong>
            {totalStudySessions}
          </strong>

          <small>
            {completedStudySessions} completed
          </small>
        </div>

        <div className="stat-card">
          <span>Completion</span>

          <strong>
            {overallCompletion}%
          </strong>

          <small>
            Overall academic progress
          </small>
        </div>

      </div>

      {/* CHARTS */}

      <div className="analytics-grid">

        {/* WEEKLY STUDY */}

        <section className="chart-card">

          <div className="card-heading">

            <div>

              <span>
                STUDY ACTIVITY
              </span>

              <h2>
                Weekly Study Hours
              </h2>

            </div>

            <strong>
              {totalStudyHours}h
            </strong>

          </div>

          <div className="bar-chart">

            {weeklyStudy.map((item) => {
              const hours =
                Number(item?.hours) || 0

              const height =
                hours > 0
                  ? Math.max(
                      (hours / calculatedMax) * 100,
                      8
                    )
                  : 0

              return (
                <div
                  className="bar-column"
                  key={item.day}
                >

                  <div className="bar-value">
                    {hours}h
                  </div>

                  <div className="bar-track">

                    <div
                      className="bar"
                      style={{
                        height: `${height}%`,
                        backgroundColor:
                          hours > 0
                            ? "#17233c"
                            : "transparent",
                        minHeight:
                          hours > 0
                            ? "8px"
                            : "0px",
                        borderRadius:
                          "6px 6px 0 0",
                      }}
                    />

                  </div>

                  <span>
                    {item.day}
                  </span>

                </div>
              )
            })}

          </div>

        </section>

        {/* COMPLETION */}

        <section className="chart-card">

          <div className="card-heading">

            <div>

              <span>
                ACADEMIC PROGRESS
              </span>

              <h2>
                Overall Completion
              </h2>

            </div>

          </div>

          <div className="completion-chart">

            <div
              className="completion-ring"
              style={{
                borderRightColor:
                  overallCompletion < 50
                    ? "#dfe1e5"
                    : "#17233c",
              }}
            >

              <strong>
                {overallCompletion}%
              </strong>

              <span>
                Complete
              </span>

            </div>

            <div className="completion-details">

              <div>

                <span className="dot dark"></span>

                Assignments

                <strong>
                  {assignmentCompletion}%
                </strong>

              </div>

              <div>

                <span className="dot grey"></span>

                Study Goals

                <strong>
                  {studyCompletion}%
                </strong>

              </div>

              <div>

                <span className="dot light"></span>

                Exams

                <strong>
                  {examCount}
                </strong>

              </div>

            </div>

          </div>

        </section>

      </div>

      {/* INSIGHT */}

      <section className="insights-card">

        <div>

          <span className="analytics-eyebrow">
            WEEKLY INSIGHT
          </span>

          {totalStudySessions === 0 ? (
            <>
              <h2>
                Start building your study history.
              </h2>

              <p>
                Add study sessions in the Study
                Planner and complete them to see
                meaningful analytics here.
              </p>
            </>
          ) : (
            <>
              <h2>
                Keep building consistency.
              </h2>

              <p>
                Your highest study activity is on{" "}
                {highestStudyDay.day} with{" "}
                {highestStudyDay.hours} hours.
                Keep completing your planned
                sessions to improve your progress.
              </p>
            </>
          )}

        </div>

        <div className="insight-number">

          <strong>
            {totalStudyHours}
          </strong>

          <span>
            hours planned
          </span>

        </div>

      </section>

    </div>
  )
}

export default Analytics