import { useEffect, useState } from "react"
import "./Timetable.css"

function Timetable() {
  const [classes, setClasses] = useState([])
  const [showForm, setShowForm] = useState(false)

  const [subject, setSubject] = useState("")
  const [day, setDay] = useState("Monday")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [room, setRoom] = useState("")

  // NEW:
  // Date selected while adding a class.
  // The selected date decides which week the class belongs to.
  const [selectedDate, setSelectedDate] = useState("")

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // ============================================================
  // DEFAULT TIMETABLE WEEK
  // ============================================================

  const timetableWeekStart = new Date(2026, 7, 17)

  const [weekStart, setWeekStart] = useState(
    new Date(2026, 7, 17)
  )

  // IMPORT STATES
  const [importing, setImporting] = useState(false)
  const [importedClasses, setImportedClasses] = useState([])

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ]

  // ============================================================
  // AUTH HEADERS
  // ============================================================

  function getAuthHeaders(includeJson = true) {
    const token = localStorage.getItem("token")

    return {
      ...(includeJson
        ? { "Content-Type": "application/json" }
        : {}),
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
    }
  }

  // ============================================================
  // DATE HELPERS
  // ============================================================

  // Get Monday of the week containing a date
  function getMonday(date) {
    const result = new Date(date)
    const day = result.getDay()

    result.setDate(
      result.getDate() -
        (day === 0 ? 6 : day - 1)
    )

    result.setHours(0, 0, 0, 0)

    return result
  }

  // Convert Date -> YYYY-MM-DD
  function dateToInputValue(date) {
    const year = date.getFullYear()
    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0")
    const day = String(
      date.getDate()
    ).padStart(2, "0")

    return `${year}-${month}-${day}`
  }

  // Convert YYYY-MM-DD -> Date safely
  function inputValueToDate(value) {
    if (!value) return null

    const [year, month, day] =
      value.split("-").map(Number)

    const date = new Date(
      year,
      month - 1,
      day
    )

    date.setHours(0, 0, 0, 0)

    return date
  }

  // Get YYYY-MM-DD for the Monday of selected week
  function getWeekStartValue(dateValue) {
    const date =
      inputValueToDate(dateValue)

    if (!date) return ""

    return dateToInputValue(
      getMonday(date)
    )
  }

  // ============================================================
  // CHECK IF TWO WEEKS ARE THE SAME
  // ============================================================

  function isSameWeek(date1, date2) {
    const monday1 = getMonday(date1)
    const monday2 = getMonday(date2)

    return (
      monday1.getFullYear() ===
        monday2.getFullYear() &&
      monday1.getMonth() ===
        monday2.getMonth() &&
      monday1.getDate() ===
        monday2.getDate()
    )
  }

  // ============================================================
  // CHECK IF CLASS BELONGS TO CURRENT WEEK
  // ============================================================

  function classBelongsToWeek(
    classItem,
    currentWeek
  ) {
    // New classes have weekStart.
    if (classItem.weekStart) {
      const classWeek =
        inputValueToDate(
          classItem.weekStart
        )

      if (!classWeek) {
        return false
      }

      return isSameWeek(
        classWeek,
        currentWeek
      )
    }

    // OLD classes which were created before
    // weekStart was added will remain in
    // your original timetable week.
    return isSameWeek(
      currentWeek,
      timetableWeekStart
    )
  }

  // ============================================================
  // LOAD CLASSES
  // ============================================================

  useEffect(() => {
    fetch("http://localhost:5000/api/timetable", {
      headers: getAuthHeaders(),
    })
      .then((response) => response.json())
      .then((data) => {
        setClasses(
          Array.isArray(data) ? data : []
        )

        setLoading(false)

        if (
          !Array.isArray(data) &&
          data?.message
        ) {
          setError(data.message)
        }
      })
      .catch((error) => {
        console.error(
          "Load timetable error:",
          error
        )

        setError(
          "Unable to load timetable. Make sure the backend is running."
        )

        setLoading(false)
      })
  }, [])

  // ============================================================
  // ADD CLASS
  // ============================================================

  async function addClass(e) {
    e.preventDefault()

    if (
      !subject ||
      !startTime ||
      !endTime ||
      !selectedDate
    ) {
      setError(
        "Please fill in the required fields."
      )
      return
    }

    if (startTime >= endTime) {
      setError(
        "End time must be later than start time."
      )
      return
    }

    setError("")

    // Convert selected date into the Monday
    // of that week.
    const selectedWeekStart =
      getWeekStartValue(selectedDate)

    try {
      const response = await fetch(
        "http://localhost:5000/api/timetable",
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            subject,
            day,
            startTime,
            endTime,
            room,

            // NEW:
            // Save which week this class belongs to.
            weekStart: selectedWeekStart,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        setError(
          data.message ||
            "Could not add class."
        )
        return
      }

      setClasses(
        (previousClasses) => [
          ...previousClasses,
          data,
        ]
      )

      setSubject("")
      setDay("Monday")
      setStartTime("")
      setEndTime("")
      setRoom("")

      // Reset selected date to current
      // displayed calendar week.
      setSelectedDate(
        dateToInputValue(weekStart)
      )

      setShowForm(false)
    } catch (error) {
      console.error(
        "Add class error:",
        error
      )

      setError(
        "Unable to connect to the server."
      )
    }
  }

  // ============================================================
  // DELETE CLASS
  // ============================================================

  async function deleteClass(id) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/timetable/${id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      )

      if (!response.ok) {
        setError("Could not delete class.")
        return
      }

      setClasses(
        (previousClasses) =>
          previousClasses.filter(
            (classItem) =>
              classItem.id !== id
          )
      )
    } catch (error) {
      console.error(
        "Delete class error:",
        error
      )

      setError(
        "Unable to connect to the server."
      )
    }
  }

  // ============================================================
  // GET CLASSES FOR A DAY
  // ============================================================

  function getClasses(dayName) {
    return classes
      .filter(
        (classItem) =>
          classItem.day === dayName &&
          classBelongsToWeek(
            classItem,
            weekStart
          )
      )
      .sort((a, b) =>
        a.startTime.localeCompare(
          b.startTime
        )
      )
  }

  // ============================================================
  // FORMAT TIME
  // ============================================================

  function formatTime(time) {
    if (!time) return ""

    const [hours, minutes] =
      time.split(":")

    let hour = Number(hours)

    const period =
      hour >= 12 ? "PM" : "AM"

    hour = hour % 12

    if (hour === 0) {
      hour = 12
    }

    return `${hour}:${minutes} ${period}`
  }

  // ============================================================
  // WEEK NAVIGATION
  // ============================================================

  function changeWeek(amount) {
    setWeekStart((previousDate) => {
      const newDate =
        new Date(previousDate)

      newDate.setDate(
        newDate.getDate() +
          amount * 7
      )

      return newDate
    })
  }

  // ============================================================
  // GO TO CURRENT WEEK
  // ============================================================

  function goToToday() {
    const today = new Date()

    const monday =
      getMonday(today)

    setWeekStart(monday)
  }

  // ============================================================
  // GET DATE FOR EACH DAY
  // ============================================================

  function getDayDate(index) {
    const date =
      new Date(weekStart)

    date.setDate(
      date.getDate() + index
    )

    return date
  }

  // ============================================================
  // FORMAT DATE
  // ============================================================

  function formatDate(date) {
    return date.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
      }
    )
  }

  // ============================================================
  // GET WEEK END
  // ============================================================

  function getWeekEnd() {
    const end =
      new Date(weekStart)

    end.setDate(
      end.getDate() + 6
    )

    return end
  }

  // ============================================================
  // GET WEEK NUMBER
  // ============================================================

  function getWeekNumber(date) {
    const firstDayOfYear =
      new Date(
        date.getFullYear(),
        0,
        1
      )

    const pastDays =
      Math.floor(
        (date - firstDayOfYear) /
          (24 * 60 * 60 * 1000)
      )

    return Math.ceil(
      (
        pastDays +
        firstDayOfYear.getDay() +
        1
      ) / 7
    )
  }

  // ============================================================
  // OPEN ADD CLASS FORM
  // ============================================================

  function openAddClassForm() {
    if (!showForm) {
      // When opening the form,
      // automatically select the currently
      // displayed calendar week.
      setSelectedDate(
        dateToInputValue(weekStart)
      )
    }

    setShowForm(
      (previous) => !previous
    )
  }

  // ============================================================
  // IMPORT TIMETABLE
  // ============================================================

  async function handleImportTimetable(
    event
  ) {
    const file =
      event.target.files[0]

    if (!file) return

    setError("")
    setImporting(true)
    setImportedClasses([])

    try {
      const formData =
        new FormData()

      formData.append(
        "timetable",
        file
      )

      const response =
        await fetch(
          "http://localhost:5000/api/timetable/import",
          {
            method: "POST",
            headers:
              getAuthHeaders(false),
            body: formData,
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        setError(
          data.message ||
            "Could not import timetable."
        )
        return
      }

      console.log(
        "Imported timetable:",
        data
      )

      if (
        Array.isArray(
          data.classes
        ) &&
        data.classes.length > 0
      ) {
        setImportedClasses(
          data.classes
        )
      } else {
        setError(
          data.message ||
            "No timetable classes could be detected."
        )
      }
    } catch (error) {
      console.error(
        "Timetable import error:",
        error
      )

      setError(
        "Unable to connect to the timetable import server."
      )
    } finally {
      setImporting(false)
    }

    event.target.value = ""
  }

  // ============================================================
  // ADD IMPORTED CLASSES
  // ============================================================

  async function addImportedClasses() {
    if (
      importedClasses.length === 0
    ) {
      return
    }

    setError("")

    try {
      const newClasses = []

      for (
        const classItem
        of importedClasses
      ) {
        const response =
          await fetch(
            "http://localhost:5000/api/timetable",
            {
              method: "POST",
              headers:
                getAuthHeaders(),
              body:
                JSON.stringify({
                  ...classItem,

                  // Imported classes are assigned
                  // to the currently displayed week.
                  weekStart:
                    dateToInputValue(
                      weekStart
                    ),
                }),
            }
          )

        const data =
          await response.json()

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Could not add imported class."
          )
        }

        newClasses.push(data)
      }

      setClasses(
        (previousClasses) => [
          ...previousClasses,
          ...newClasses,
        ]
      )

      setImportedClasses([])
    } catch (error) {
      console.error(
        "Add imported classes error:",
        error
      )

      setError(
        "Some imported classes could not be added."
      )
    }
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="timetable-page">
        <div
          style={{
            maxWidth: "1250px",
            margin: "60px auto",
            textAlign: "center",
            color: "#777",
          }}
        >
          Loading timetable...
        </div>
      </div>
    )
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="timetable-page">

      {/* HEADER */}

      <div className="timetable-top">

        <div>

          <p className="timetable-label">
            MY SCHEDULE
          </p>

          <h1>
            Weekly Timetable
          </h1>

          <p className="timetable-subtitle">
            Keep your classes, labs, and university schedule in one place.
          </p>

        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >

          {/* IMPORT BUTTON */}

          <label
            className="add-class-btn"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: importing
                ? "wait"
                : "pointer",
            }}
          >

            {importing
              ? "Reading..."
              : "Import Timetable"}

            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={
                handleImportTimetable
              }
              disabled={importing}
              style={{
                display: "none",
              }}
            />

          </label>

          {/* ADD CLASS */}

          <button
            className="add-class-btn"
            onClick={
              openAddClassForm
            }
          >
            {showForm
              ? "× Close"
              : "+ Add Class"}
          </button>

        </div>

      </div>

      {/* IMPORTED CLASSES */}

      {importedClasses.length > 0 && (

        <div
          style={{
            maxWidth: "1250px",
            margin: "0 auto 20px",
            padding: "20px",
            background: "white",
            border:
              "1px solid #e4e8f0",
            borderRadius: "14px",
          }}
        >

          <h2
            style={{
              margin: "0 0 5px",
              color: "#17233c",
              fontSize: "18px",
            }}
          >
            Detected Classes
          </h2>

          <p
            style={{
              margin: "0 0 15px",
              color: "#777",
              fontSize: "12px",
            }}
          >
            Check the detected classes before adding them to your timetable.
          </p>

          {importedClasses.map(
            (
              classItem,
              index
            ) => (

              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "center",
                  padding: "12px",
                  marginBottom: "8px",
                  background:
                    "#f7f8fc",
                  borderRadius: "9px",
                }}
              >

                <strong
                  style={{
                    color: "#17233c",
                    fontSize: "13px",
                  }}
                >
                  {
                    classItem.subject
                  }
                </strong>

                <span
                  style={{
                    color: "#777",
                    fontSize: "12px",
                  }}
                >

                  {
                    classItem.day
                  }

                  {" • "}

                  {formatTime(
                    classItem.startTime
                  )}

                  {" – "}

                  {formatTime(
                    classItem.endTime
                  )}

                  {classItem.room
                    ? ` • ${classItem.room}`
                    : ""}

                </span>

              </div>

            )
          )}

          <button
            type="button"
            onClick={
              addImportedClasses
            }
            style={{
              marginTop: "10px",
              padding:
                "11px 18px",
              border: "none",
              borderRadius: "8px",
              background:
                "#17233c",
              color: "white",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Add Detected Classes
          </button>

        </div>

      )}

      {/* ADD CLASS FORM */}

      {showForm && (

        <form
          onSubmit={addClass}
          style={{
            maxWidth: "1250px",
            margin: "0 auto 18px",
            padding: "18px",
            display: "grid",
            gridTemplateColumns:
              "1.3fr 1fr 1fr 1fr 1fr 1.2fr auto",
            gap: "10px",
            background: "white",
            border:
              "1px solid #e4e8f0",
            borderRadius: "14px",
          }}
        >

          {/* SUBJECT */}

          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) =>
              setSubject(
                e.target.value
              )
            }
            style={inputStyle}
          />

          {/* DAY */}

          <select
            value={day}
            onChange={(e) =>
              setDay(e.target.value)
            }
            style={inputStyle}
          >

            {days.map(
              (dayName) => (

                <option
                  value={dayName}
                  key={dayName}
                >
                  {dayName}
                </option>

              )
            )}

          </select>

          {/* START TIME */}

          <input
            type="time"
            value={startTime}
            onChange={(e) =>
              setStartTime(
                e.target.value
              )
            }
            style={inputStyle}
          />

          {/* END TIME */}

          <input
            type="time"
            value={endTime}
            onChange={(e) =>
              setEndTime(
                e.target.value
              )
            }
            style={inputStyle}
          />

          {/* ROOM */}

          <input
            type="text"
            placeholder="Room"
            value={room}
            onChange={(e) =>
              setRoom(
                e.target.value
              )
            }
            style={inputStyle}
          />

          {/* NEW WEEK / DATE OPTION */}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >

            <label
              style={{
                fontSize: "10px",
                color: "#777",
                fontWeight: "600",
              }}
            >
              Week / Date
            </label>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) =>
                setSelectedDate(
                  e.target.value
                )
              }
              style={inputStyle}
              required
            />

          </div>

          {/* SAVE */}

          <button
            type="submit"
            style={{
              border: "none",
              borderRadius: "8px",
              padding: "0 18px",
              background:
                "#17233c",
              color: "white",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Save
          </button>

        </form>

      )}

      {/* ERROR */}

      {error && (

        <p
          style={{
            maxWidth: "1250px",
            margin: "0 auto 15px",
            color: "#c0392b",
            fontSize: "13px",
          }}
        >
          {error}
        </p>

      )}

      {/* CALENDAR TOOLBAR */}

      <div className="calendar-toolbar">

        <div className="week-navigation">

          <button
            type="button"
            onClick={() =>
              changeWeek(-1)
            }
          >
            ‹
          </button>

          <div>

            <strong>
              {formatDate(
                weekStart
              )}

              {" – "}

              {formatDate(
                getWeekEnd()
              )}
            </strong>

            <span>
              Week{" "}
              {getWeekNumber(
                weekStart
              )}
            </span>

          </div>

          <button
            type="button"
            onClick={() =>
              changeWeek(1)
            }
          >
            ›
          </button>

        </div>

        <button
          type="button"
          className="today-btn"
          onClick={goToToday}
        >
          Today
        </button>

      </div>

      {/* WEEK STATUS */}

      {classes.filter(
        (classItem) =>
          classBelongsToWeek(
            classItem,
            weekStart
          )
      ).length === 0 && (

        <div
          style={{
            maxWidth: "1250px",
            margin: "0 auto 15px",
            padding: "12px 16px",
            background: "#f7f8fc",
            border:
              "1px solid #e4e8f0",
            borderRadius: "10px",
            color: "#777",
            fontSize: "12px",
            textAlign: "center",
          }}
        >
          No classes scheduled for this week.
        </div>

      )}

      {/* CALENDAR */}

      <div className="calendar">

        <div className="time-corner"></div>

        {/* DAY HEADERS */}

        {days.map(
          (
            dayName,
            index
          ) => {

            const date =
              getDayDate(index)

            const today =
              new Date()

            const isToday =
              date.toDateString() ===
              today.toDateString()

            return (

              <div
                className={`calendar-day ${
                  isToday
                    ? "today"
                    : ""
                }`}
                key={dayName}
              >

                <span>
                  {dayName
                    .slice(0, 3)
                    .toUpperCase()}
                </span>

                <strong>
                  {date.getDate()}
                </strong>

              </div>

            )
          }
        )}

        {/* TIME COLUMN */}

        <div className="time-column">

          <span>08:00</span>
          <span>09:00</span>
          <span>10:00</span>
          <span>11:00</span>
          <span>12:00</span>
          <span>01:00</span>
          <span>02:00</span>
          <span>03:00</span>
          <span>04:00</span>

        </div>

        {/* DAY COLUMNS */}

        {days.map(
          (
            dayName,
            index
          ) => {

            const date =
              getDayDate(index)

            const today =
              new Date()

            const isToday =
              date.toDateString() ===
              today.toDateString()

            return (

              <div
                className={`calendar-column ${
                  isToday
                    ? "today-column"
                    : ""
                }`}
                key={dayName}
              >

                {getClasses(
                  dayName
                ).map(
                  (
                    classItem
                  ) => (

                    <div
                      className={`class-block ${
                        index % 3 === 0
                          ? "web"
                          : index % 3 === 1
                          ? "compiler"
                          : "cyber"
                      }`}
                      key={
                        classItem.id
                      }
                      onDoubleClick={() =>
                        deleteClass(
                          classItem.id
                        )
                      }
                      title="Double-click to delete"
                    >

                      <strong>
                        {
                          classItem.subject
                        }
                      </strong>

                      <span>
                        {formatTime(
                          classItem.startTime
                        )}

                        {" – "}

                        {formatTime(
                          classItem.endTime
                        )}
                      </span>

                      <small>
                        {
                          classItem.room ||
                          "No room"
                        }
                      </small>

                    </div>

                  )
                )}

              </div>

            )
          }
        )}

      </div>

      {/* LEGEND */}

      <div className="calendar-legend">

        <div>
          <span className="legend-dot web-dot"></span>
          Classes
        </div>

        <div>
          <span className="legend-dot compiler-dot"></span>
          Labs
        </div>

        <div>
          <span className="legend-dot cyber-dot"></span>
          Other
        </div>

      </div>

      {/* DELETE HINT */}

      {classes.length > 0 && (

        <p
          style={{
            maxWidth: "1250px",
            margin: "12px auto 0",
            color: "#999",
            fontSize: "11px",
            textAlign: "right",
          }}
        >
          Double-click a class to delete it.
        </p>

      )}

    </div>
  )
}

const inputStyle = {
  minWidth: 0,
  padding: "12px 13px",
  border:
    "1px solid #e1e4e9",
  borderRadius: "8px",
  outline: "none",
  background: "#ffffff",
  color: "#17233c",
  fontFamily: "inherit",
  fontSize: "13px",
}

export default Timetable