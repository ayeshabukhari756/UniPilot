import { useEffect, useState } from "react"
import "./Assignments.css"

function Assignments() {
  const [assignments, setAssignments] = useState([])

  const [subject, setSubject] = useState("")
  const [title, setTitle] = useState("")
  const [dueDate, setDueDate] = useState("")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [showSuggestions, setShowSuggestions] = useState(false)

  function getAuthHeaders() {
    const token = localStorage.getItem("token")

    return {
      "Content-Type": "application/json",
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
    }
  }

  // COMMON UNIVERSITY SUBJECTS

  const subjectSuggestions = [
    "Chemistry",
    "Computer Science",
    "Web Engineering",
    "Compiler Construction",
    "Cyber Security",
    "Database Systems",
    "Data Structures",
    "Object Oriented Programming",
    "Operating Systems",
    "Software Engineering",
    "Artificial Intelligence",
    "Machine Learning",
    "Computer Networks",
    "Information Security",
    "Calculus",
    "Discrete Mathematics",
    "Linear Algebra",
    "English",
    "Communication Skills",
  ]

  // LOAD ASSIGNMENTS

  useEffect(() => {
    fetch("http://localhost:5000/api/assignments", {
      headers: getAuthHeaders(),
    })
      .then((response) => response.json())
      .then((data) => {
        setAssignments(Array.isArray(data) ? data : [])
        setLoading(false)

        if (!Array.isArray(data) && data?.message) {
          setError(data.message)
        }
      })
      .catch((error) => {
        console.error("Load assignments error:", error)

        setError(
          "Unable to load assignments. Make sure the backend is running."
        )

        setLoading(false)
      })
  }, [])

  // SUBJECT SUGGESTIONS

  const filteredSubjects = subject
    ? subjectSuggestions.filter((item) =>
        item.toLowerCase().includes(subject.toLowerCase())
      )
    : []

  function selectSubject(selectedSubject) {
    setSubject(selectedSubject)
    setShowSuggestions(false)
  }

  // ADD ASSIGNMENT

  async function addAssignment(e) {
    e.preventDefault()

    if (!subject || !title || !dueDate) {
      setError("Please fill in all fields.")
      return
    }

    // CHECK PAST DATE

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const selectedDate = new Date(dueDate + "T00:00:00")
    selectedDate.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
      const addPastAssignment = window.confirm(
        "This assignment date has already passed.\n\nAre you sure you want to add an assignment for this date?"
      )

      if (!addPastAssignment) {
        return
      }
    }

    setError("")

    try {
      const response = await fetch(
        "http://localhost:5000/api/assignments",
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            subject,
            title,
            dueDate,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Could not add assignment.")
        return
      }

      setAssignments((previousAssignments) => [
        ...previousAssignments,
        data,
      ])

      setSubject("")
      setTitle("")
      setDueDate("")
      setError("")
      setShowSuggestions(false)
    } catch (error) {
      console.error("Add assignment error:", error)

      setError("Unable to connect to the server.")
    }
  }

  // TOGGLE COMPLETE

  async function toggleComplete(id, completed) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/assignments/${id}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            completed: !completed,
          }),
        }
      )

      if (!response.ok) {
        return
      }

      setAssignments((previousAssignments) =>
        previousAssignments.map((assignment) =>
          assignment.id === id
            ? {
                ...assignment,
                completed: !completed,
              }
            : assignment
        )
      )
    } catch (error) {
      console.error("Update assignment error:", error)
    }
  }

  // DELETE ASSIGNMENT

  async function deleteAssignment(id) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/assignments/${id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      )

      if (!response.ok) {
        return
      }

      setAssignments((previousAssignments) =>
        previousAssignments.filter(
          (assignment) => assignment.id !== id
        )
      )
    } catch (error) {
      console.error("Delete assignment error:", error)
    }
  }

  // COUNTS

  const completedCount = assignments.filter(
    (assignment) => assignment.completed
  ).length

  const pendingCount =
    assignments.length - completedCount

  // CALENDAR GROUPING

  const calendarAssignments = [...assignments].sort(
    (a, b) =>
      new Date(a.dueDate) - new Date(b.dueDate)
  )

  function formatCalendarDate(dateString) {
    const date = new Date(dateString + "T00:00:00")

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="assignments-page">

      {/* HEADER */}

      <header className="assignments-header">

        <div>
          <span className="assignments-eyebrow">
            ACADEMIC WORK
          </span>

          <h1>Assignments</h1>

          <p>
            Track your assignments, deadlines and completion progress.
          </p>
        </div>

        <div className="assignment-summary">

          <div>
            <strong>{assignments.length}</strong>
            <span>Total</span>
          </div>

          <div>
            <strong>{pendingCount}</strong>
            <span>Pending</span>
          </div>

          <div>
            <strong>{completedCount}</strong>
            <span>Done</span>
          </div>

        </div>

      </header>


      {/* ADD ASSIGNMENT */}

      <section className="assignment-section">

        <div className="section-heading">

          <div>
            <span>ASSIGNMENTS</span>
            <h2>Add a new assignment</h2>
          </div>

        </div>

        <form
          className="assignment-form"
          onSubmit={addAssignment}
        >

          {/* SUBJECT */}

          <div className="subject-input-wrapper">

            <input
              type="text"
              placeholder="Subject"
              value={subject}
              autoComplete="off"
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setSubject(e.target.value)
                setShowSuggestions(true)
              }}
            />

            {showSuggestions &&
              subject &&
              filteredSubjects.length > 0 && (

                <div className="subject-suggestions">

                  {filteredSubjects
                    .slice(0, 6)
                    .map((suggestion) => (

                      <button
                        type="button"
                        key={suggestion}
                        onClick={() =>
                          selectSubject(suggestion)
                        }
                      >
                        {suggestion}
                      </button>

                    ))}

                </div>

              )}

          </div>


          {/* TITLE */}

          <input
            type="text"
            placeholder="Assignment title"
            value={title}
            onChange={(e) =>
              setTitle(e.target.value)
            }
          />


          {/* DATE */}

          <input
            type="date"
            value={dueDate}
            onChange={(e) =>
              setDueDate(e.target.value)
            }
          />


          {/* BUTTON */}

          <button type="submit">
            + Add Assignment
          </button>

        </form>


        {error && (
          <p className="assignment-error">
            {error}
          </p>
        )}

      </section>


      {/* ASSIGNMENT CALENDAR */}

      <section className="assignment-section">

        <div className="section-heading">

          <div>
            <span>DEADLINE CALENDAR</span>
            <h2>Upcoming deadlines</h2>
          </div>

          <span className="assignment-total">
            {assignments.length} items
          </span>

        </div>


        {loading ? (

          <div className="empty-state">

            <h2>Loading assignments...</h2>

            <p>
              Getting your assignments from the server.
            </p>

          </div>

        ) : calendarAssignments.length === 0 ? (

          <div className="empty-state">

            <h2>No deadlines yet</h2>

            <p>
              Your assignment deadlines will appear here.
            </p>

          </div>

        ) : (

          <div className="assignment-calendar">

            {calendarAssignments.map((assignment) => (

              <div
                className={`calendar-assignment ${
                  assignment.completed
                    ? "calendar-completed"
                    : ""
                }`}
                key={`calendar-${assignment.id}`}
              >

                <div className="calendar-date">

                  <strong>
                    {new Date(
                      assignment.dueDate + "T00:00:00"
                    ).getDate()}
                  </strong>

                  <span>
                    {new Date(
                      assignment.dueDate + "T00:00:00"
                    ).toLocaleDateString("en-US", {
                      month: "short",
                    })}
                  </span>

                </div>


                <div className="calendar-assignment-info">

                  <span>
                    {assignment.subject}
                  </span>

                  <h3>
                    {assignment.title}
                  </h3>

                  <p>
                    {formatCalendarDate(
                      assignment.dueDate
                    )}
                  </p>

                </div>


                <div className="calendar-status">

                  {assignment.completed
                    ? "Done"
                    : "Pending"}

                </div>

              </div>

            ))}

          </div>

        )}

      </section>


      {/* YOUR WORK */}

      <section className="assignment-section">

        <div className="section-heading">

          <div>
            <span>YOUR WORK</span>
            <h2>Assignment list</h2>
          </div>

          <span className="assignment-total">
            {assignments.length} items
          </span>

        </div>


        <div className="assignment-list">

          {loading ? (

            <div className="empty-state">

              <h2>Loading assignments...</h2>

              <p>
                Getting your assignments from the server.
              </p>

            </div>

          ) : assignments.length === 0 ? (

            <div className="empty-state">

              <h2>No assignments yet</h2>

              <p>
                Add your first assignment above to start tracking your work.
              </p>

            </div>

          ) : (

            assignments.map((assignment, index) => (

              <article
                className={`assignment-card ${
                  assignment.completed
                    ? "completed"
                    : ""
                }`}
                key={assignment.id}
              >

                <div className="assignment-number">
                  {String(index + 1).padStart(2, "0")}
                </div>


                <div className="assignment-info">

                  <span className="subject">
                    {assignment.subject}
                  </span>

                  <h2>
                    {assignment.title}
                  </h2>

                  <p>
                    Due: {assignment.dueDate}
                  </p>

                </div>


                <div className="assignment-status">

                  <span
                    className={
                      assignment.completed
                        ? "status-done"
                        : "status-pending"
                    }
                  >
                    {assignment.completed
                      ? "Completed"
                      : "Pending"}
                  </span>

                </div>


                <div className="assignment-actions">

                  <button
                    className="complete-btn"
                    onClick={() =>
                      toggleComplete(
                        assignment.id,
                        assignment.completed
                      )
                    }
                  >
                    {assignment.completed
                      ? "Completed"
                      : "Mark Complete"}
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() =>
                      deleteAssignment(
                        assignment.id
                      )
                    }
                  >
                    Delete
                  </button>

                </div>

              </article>

            ))

          )}

        </div>

      </section>

    </div>
  )
}

export default Assignments