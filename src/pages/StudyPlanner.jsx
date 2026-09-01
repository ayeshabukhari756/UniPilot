import { useEffect, useState } from "react"
import "./StudyPlanner.css"

function StudyPlanner() {
  const [tasks, setTasks] = useState([])

  const [subject, setSubject] = useState("")
  const [topic, setTopic] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [duration, setDuration] = useState("")
  const [priority, setPriority] = useState("Medium")

  const [gpaRows, setGpaRows] = useState([
    { id: 1, course: "", credit: "", grade: "" },
    { id: 2, course: "", credit: "", grade: "" },
    { id: 3, course: "", credit: "", grade: "" },
  ])

  const [gpa, setGpa] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const today = new Date().toISOString().split("T")[0]

  function getAuthHeaders() {
    const token = localStorage.getItem("token")

    return {
      "Content-Type": "application/json",
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
    }
  }

  useEffect(() => {
    async function loadSessions() {
      try {
        const response = await fetch(
          "https://unipilot-production.up.railway.app/api/study-sessions",
          {
            headers: getAuthHeaders(),
          }
        )

        if (!response.ok) {
          throw new Error("Could not load study sessions.")
        }

        const data = await response.json()

        setTasks(Array.isArray(data) ? data : [])
        setLoading(false)
      } catch (error) {
        console.error("Study Planner Error:", error)

        setError(
          "Unable to load study sessions. Make sure the backend is running."
        )

        setLoading(false)
      }
    }

    loadSessions()
  }, [])

  async function addTask(e) {
    e.preventDefault()

    if (
      !subject ||
      !topic ||
      !date ||
      !time ||
      !duration
    ) {
      return
    }

    if (date < today) {
      alert("Please select today or a future date.")
      return
    }

    try {
      const response = await fetch(
        "https://unipilot-production.up.railway.app/api/study-sessions",
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            subject,
            topic,
            date,
            time,
            duration: Number(duration),
            priority,
          }),
        }
      )

      if (!response.ok) {
        throw new Error("Could not add study session.")
      }

      const newTask = await response.json()

      setTasks((previousTasks) => [
        ...previousTasks,
        newTask,
      ])

      setSubject("")
      setTopic("")
      setDate("")
      setTime("")
      setDuration("")
      setPriority("Medium")
      setError("")
    } catch (error) {
      console.error("Add Study Session Error:", error)

      setError(
        "Could not add study session. Make sure the backend is running."
      )
    }
  }

  async function toggleComplete(id) {
    const task = tasks.find(
      (item) => item.id === id
    )

    if (!task) return

    const newCompleted = !task.completed

    try {
      const response = await fetch(
        `https://unipilot-production.up.railway.app/api/study-sessions/${id}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            completed: newCompleted,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(
          "Could not update study session."
        )
      }

      setTasks((previousTasks) =>
        previousTasks.map((item) =>
          item.id === id
            ? {
                ...item,
                completed: newCompleted,
              }
            : item
        )
      )
    } catch (error) {
      console.error(
        "Update Study Session Error:",
        error
      )

      setError(
        "Could not update study session."
      )
    }
  }

  async function deleteTask(id) {
    try {
      const response = await fetch(
        `https://unipilot-production.up.railway.app/api/study-sessions/${id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      )

      if (!response.ok) {
        throw new Error(
          "Could not delete study session."
        )
      }

      setTasks((previousTasks) =>
        previousTasks.filter(
          (task) => task.id !== id
        )
      )
    } catch (error) {
      console.error(
        "Delete Study Session Error:",
        error
      )

      setError(
        "Could not delete study session."
      )
    }
  }

  function updateGpaRow(id, field, value) {
    setGpaRows(
      gpaRows.map((row) =>
        row.id === id
          ? { ...row, [field]: value }
          : row
      )
    )
  }

  function addGpaRow() {
    setGpaRows([
      ...gpaRows,
      {
        id: Date.now(),
        course: "",
        credit: "",
        grade: "",
      },
    ])
  }

  function removeGpaRow(id) {
    if (gpaRows.length === 1) return

    setGpaRows(
      gpaRows.filter((row) => row.id !== id)
    )
  }

  function calculateGpa() {
    let totalPoints = 0
    let totalCredits = 0

    gpaRows.forEach((row) => {
      const credit = Number(row.credit)
      const grade = Number(row.grade)

      if (
        row.credit !== "" &&
        row.grade !== "" &&
        credit > 0 &&
        grade >= 0
      ) {
        totalPoints += credit * grade
        totalCredits += credit
      }
    })

    if (totalCredits === 0) {
      setGpa(null)
      return
    }

    const result = totalPoints / totalCredits

    setGpa(result.toFixed(2))
  }

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length

  const progress =
    tasks.length === 0
      ? 0
      : Math.round(
          (completedTasks / tasks.length) * 100
        )

  if (loading) {
    return (
      <div className="planner-page">
        <div className="empty-planner">
          <h2>Loading study planner...</h2>
          <p>
            Loading your study sessions.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="planner-page">

      <div className="planner-header">

        <div>
          <p className="planner-eyebrow">
            ACADEMIC PLANNING
          </p>

          <h1>
            Study Planner
          </h1>

          <p>
            Plan your study sessions, track your progress,
            and manage your academic goals.
          </p>
        </div>

        <div className="progress-box">
          <strong>{progress}%</strong>
          <span>Today's Progress</span>
        </div>

      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${progress}%`,
          }}
        ></div>
      </div>

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

      <section className="planner-section">

        <div className="section-heading">

          <div>

            <p className="section-label">
              STUDY SESSIONS
            </p>

            <h2>
              Plan your next session
            </h2>

          </div>

        </div>

        <form
          className="planner-form"
          onSubmit={addTask}
        >

          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) =>
              setSubject(e.target.value)
            }
          />

          <input
            type="text"
            placeholder="Topic to study"
            value={topic}
            onChange={(e) =>
              setTopic(e.target.value)
            }
          />

          <input
            type="date"
            value={date}
            min={today}
            onChange={(e) =>
              setDate(e.target.value)
            }
          />

          <input
            type="time"
            value={time}
            onChange={(e) =>
              setTime(e.target.value)
            }
          />

          <input
            type="number"
            placeholder="Minutes"
            value={duration}
            onChange={(e) =>
              setDuration(e.target.value)
            }
            min="1"
          />

          <select
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value)
            }
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <button type="submit">
            + Add Session
          </button>

        </form>

      </section>

      <section className="planner-section">

        <div className="section-heading">

          <div>

            <p className="section-label">
              YOUR PLAN
            </p>

            <h2>
              Upcoming study sessions
            </h2>

          </div>

        </div>

        <div className="planner-list">

          {tasks.length === 0 ? (

            <div className="empty-planner">

              <h2>
                No study sessions
              </h2>

              <p>
                Add a session to start planning
                your day.
              </p>

            </div>

          ) : (

            tasks.map((task) => (

              <div
                className={`study-card ${
                  task.completed
                    ? "completed"
                    : ""
                }`}
                key={task.id}
              >

                <div className="study-time">

                  <strong>
                    {task.time}
                  </strong>

                  <span>
                    {task.duration} min
                  </span>

                </div>

                <div className="study-info">

                  <span className="study-subject">
                    {task.subject}
                  </span>

                  <h2>
                    {task.topic}
                  </h2>

                  <span
                    className={`priority ${
                      task.priority.toLowerCase()
                    }`}
                  >
                    {task.priority} Priority
                  </span>

                  <small>
                    {task.date}
                  </small>

                </div>

                <div className="study-actions">

                  <button
                    className="complete-study"
                    onClick={() =>
                      toggleComplete(task.id)
                    }
                  >
                    {task.completed
                      ? "Completed"
                      : "Complete"}
                  </button>

                  <button
                    className="delete-study"
                    onClick={() =>
                      deleteTask(task.id)
                    }
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))

          )}

        </div>

      </section>

      <section className="academic-tools">

        <div className="academic-tools-header">

          <div>

            <p className="section-label">
              ACADEMIC TOOL
            </p>

            <h2>
              GPA Calculator
            </h2>

            <p>
              Calculate your semester GPA using your
              course credits and grade points.
            </p>

          </div>

          <div className="gpa-result">

            <span>
              Your GPA
            </span>

            <strong>
              {gpa !== null
                ? gpa
                : "—"}
            </strong>

          </div>

        </div>

        <div className="gpa-table">

          <div className="gpa-table-header">

            <span>Course</span>

            <span>
              Credit Hours
            </span>

            <span>
              Grade Point
            </span>

            <span></span>

          </div>

          {gpaRows.map((row) => (

            <div
              className="gpa-row"
              key={row.id}
            >

              <input
                type="text"
                placeholder="e.g. Web Engineering"
                value={row.course}
                onChange={(e) =>
                  updateGpaRow(
                    row.id,
                    "course",
                    e.target.value
                  )
                }
              />

              <input
                type="number"
                placeholder="3"
                min="1"
                step="1"
                value={row.credit}
                onChange={(e) =>
                  updateGpaRow(
                    row.id,
                    "credit",
                    e.target.value
                  )
                }
              />

              <input
                type="number"
                placeholder="4.0"
                min="0"
                max="4"
                step="0.01"
                value={row.grade}
                onChange={(e) =>
                  updateGpaRow(
                    row.id,
                    "grade",
                    e.target.value
                  )
                }
              />

              <button
                type="button"
                className="remove-course"
                onClick={() =>
                  removeGpaRow(row.id)
                }
              >
                ×
              </button>

            </div>

          ))}

        </div>

        <div className="gpa-actions">

          <button
            type="button"
            className="add-course"
            onClick={addGpaRow}
          >
            + Add Course
          </button>

          <button
            type="button"
            className="calculate-gpa"
            onClick={calculateGpa}
          >
            Calculate GPA →
          </button>

        </div>

        <p className="gpa-note">
          Enter grade points on a 4.0 scale.
          Example: A = 4.0, B = 3.0.
        </p>

      </section>

    </div>
  )
}

export default StudyPlanner