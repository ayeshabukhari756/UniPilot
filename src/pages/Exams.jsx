import { useEffect, useState } from "react"
import "./Exams.css"

function Exams() {
  const [exams, setExams] = useState([])

  const [subject, setSubject] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [type, setType] = useState("Final Exam")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // ================================
  // TODAY'S DATE
  // ================================

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

  // ================================
  // LOAD EXAMS
  // ================================

  useEffect(() => {
    async function loadExams() {
      try {
        const response = await fetch(
          "http://localhost:5000/api/exams",
          {
            headers: getAuthHeaders(),
          }
        )

        const data = await response.json().catch(() => [])

        if (!response.ok) {
          throw new Error(
            data.message || "Unable to load exams."
          )
        }

        const examList = Array.isArray(data) ? data : []

        const upcomingExams = examList.filter(
          (exam) => exam.date >= today
        )

        setExams(upcomingExams)
        setLoading(false)
      } catch (error) {
        console.error("Load Exams Error:", error)
        setError(
          error.message || "Unable to load exams."
        )
        setLoading(false)
      }
    }

    loadExams()
  }, [today])

  // ================================
  // ADD EXAM
  // ================================

  async function addExam(e) {
    e.preventDefault()

    if (!subject || !date || !time || !type) {
      setError("Please fill in all exam fields.")
      return
    }

    if (date < today) {
      setError("Exam date cannot be in the past.")
      return
    }

    setError("")

    try {
      const response = await fetch(
        "http://localhost:5000/api/exams",
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            subject,
            date,
            time,
            type,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Could not add exam.")
        return
      }

      setExams((previousExams) => [
        ...previousExams,
        data,
      ])

      setSubject("")
      setDate("")
      setTime("")
      setType("Final Exam")

    } catch (error) {
      console.error("Add Exam Error:", error)
      setError("Unable to connect to the server.")
    }
  }

  // ================================
  // DELETE EXAM
  // ================================

  async function deleteExam(id) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/exams/${id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      )

      if (!response.ok) {
        setError("Could not delete exam.")
        return
      }

      setExams((previousExams) =>
        previousExams.filter(
          (exam) => exam.id !== id
        )
      )

    } catch (error) {
      console.error("Delete Exam Error:", error)
      setError("Unable to connect to the server.")
    }
  }

  // ================================
  // LOADING
  // ================================

  if (loading) {
    return (
      <div className="exams-page">
        <div className="empty-exams">
          <h2>Loading exams...</h2>
        </div>
      </div>
    )
  }

  // ================================
  // PAGE
  // ================================

  return (
    <div className="exams-page">

      {/* HEADER */}

      <div className="exams-header">

        <div>
          <h1>Exams</h1>

          <p>
            Keep track of your upcoming university exams.
          </p>
        </div>

        <div className="exam-count">
          <strong>{exams.length}</strong>
          <span>Upcoming</span>
        </div>

      </div>

      {/* ADD EXAM FORM */}

      <form
        className="exam-form"
        onSubmit={addExam}
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
          type="date"
          min={today}
          value={date}
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

        <select
          value={type}
          onChange={(e) =>
            setType(e.target.value)
          }
        >
          <option>Final Exam</option>
          <option>Midterm</option>
          <option>Quiz</option>
          <option>Practical</option>
        </select>

        <button type="submit">
          + Add Exam
        </button>

      </form>

      {/* ERROR */}

      {error && (
        <p
          style={{
            color: "#c0392b",
            fontSize: "13px",
            marginBottom: "15px",
          }}
        >
          {error}
        </p>
      )}

      {/* EXAM LIST */}

      <div className="exam-list">

        {exams.length === 0 ? (

          <div className="empty-exams">

            <h2>No exams added</h2>

            <p>
              Add your upcoming exams above.
            </p>

          </div>

        ) : (

          exams
            .sort((a, b) =>
              `${a.date} ${a.time}`.localeCompare(
                `${b.date} ${b.time}`
              )
            )
            .map((exam) => (

              <div
                className="exam-card"
                key={exam.id}
              >

                {/* DATE */}

                <div className="exam-date">

                  <span>
                    {new Date(
                      exam.date + "T00:00:00"
                    ).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                      }
                    )}
                  </span>

                  <strong>
                    {new Date(
                      exam.date + "T00:00:00"
                    ).getDate()}
                  </strong>

                </div>

                {/* INFO */}

                <div className="exam-info">

                  <span className="exam-type">
                    {exam.type}
                  </span>

                  <h2>
                    {exam.subject}
                  </h2>

                  <p>
                    {exam.time}
                  </p>

                </div>

                {/* DELETE */}

                <button
                  className="delete-exam"
                  onClick={() =>
                    deleteExam(exam.id)
                  }
                >
                  Delete
                </button>

              </div>

            ))

        )}

      </div>

    </div>
  )
}

export default Exams