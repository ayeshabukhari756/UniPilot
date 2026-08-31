const express = require("express")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Database = require("better-sqlite3")
const multer = require("multer")
const Tesseract = require("tesseract.js")
const fs = require("fs")
const { PDFParse } = require("pdf-parse")

const app = express()
const PORT = 5000

app.use(cors())
app.use(express.json())

// ============================================================
// JWT SECRET
// ============================================================

const JWT_SECRET =
  process.env.JWT_SECRET || "unipilot-demo-secret"

// ============================================================
// TIMETABLE IMPORT
// ============================================================

const upload = multer({
  dest: "uploads/"
})

// ============================================================
// DATABASE
// ============================================================

const db = new Database("unipilot.db")

// ============================================================
// USERS
// ============================================================

db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`).run()

// ============================================================
// ASSIGNMENTS
// ============================================================

db.prepare(`
  CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    title TEXT NOT NULL,
    due_date TEXT NOT NULL,
    completed INTEGER DEFAULT 0
  )
`).run()

// ============================================================
// TIMETABLE
// ============================================================

db.prepare(`
  CREATE TABLE IF NOT EXISTS timetable (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    day TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    room TEXT,
    week_start TEXT
  )
`).run()

// IMPORTANT:
// This safely adds week_start to an OLD existing database.

try {
  db.exec(`
    ALTER TABLE timetable
    ADD COLUMN week_start TEXT
  `)
} catch (error) {
  // Column already exists — ignore
}

// ============================================================
// EXAMS
// ============================================================

db.prepare(`
  CREATE TABLE IF NOT EXISTS exams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    type TEXT NOT NULL
  )
`).run()

// ============================================================
// STUDY PLANNER
// ============================================================

db.prepare(`
  CREATE TABLE IF NOT EXISTS study_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    duration INTEGER NOT NULL,
    priority TEXT NOT NULL,
    completed INTEGER DEFAULT 0
  )
`).run()

// ============================================================
// CAREER GOALS
// ============================================================

db.prepare(`
  CREATE TABLE IF NOT EXISTS career_goals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    deadline TEXT NOT NULL
  )
`).run()

// ============================================================
// GOAL MILESTONES
// ============================================================

db.prepare(`
  CREATE TABLE IF NOT EXISTS goal_milestones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    goal_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    completed INTEGER DEFAULT 0
  )
`).run()

// ============================================================
// SKILL ROADMAP
// ============================================================

db.prepare(`
  CREATE TABLE IF NOT EXISTS skill_roadmaps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    career TEXT NOT NULL,
    skill_id INTEGER NOT NULL,
    skill_name TEXT NOT NULL,
    category TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Next',
    UNIQUE(user_id, career, skill_id)
  )
`).run()

// ============================================================
// NOTIFICATIONS
// ============================================================

db.prepare(`
  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    time TEXT NOT NULL,
    read INTEGER DEFAULT 0
  )
`).run()

console.log("Database connected successfully!")

// ============================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================

function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        message: "Access denied. Please log in."
      })
    }

    const parts = authHeader.split(" ")

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({
        message: "Invalid authorization format."
      })
    }

    const token = parts[1]

    const decoded = jwt.verify(
      token,
      JWT_SECRET
    )

    req.user = decoded

    next()

  } catch (error) {
    console.error("Authentication Error:", error)

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Your session has expired. Please log in again."
      })
    }

    return res.status(401).json({
      message: "Invalid authentication token."
    })
  }
}

// ============================================================
// TEST ROUTES
// ============================================================

app.get("/", (req, res) => {
  res.send("UniPilot backend is running!")
})

app.get("/api/test", (req, res) => {
  res.json({
    message: "UniPilot API is working!"
  })
})

// ============================================================
// AUTHENTICATION
// ============================================================

// REGISTER

app.post("/api/auth/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password
    } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please fill in all fields."
      })
    }

    const existingUser = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email)

    if (existingUser) {
      return res.status(400).json({
        message: "An account with this email already exists."
      })
    }

    const hashedPassword =
      await bcrypt.hash(password, 10)

    const result = db.prepare(`
      INSERT INTO users (name, email, password)
      VALUES (?, ?, ?)
    `).run(
      name,
      email,
      hashedPassword
    )

    res.status(201).json({
      message: "Account created successfully!",
      userId: result.lastInsertRowid
    })

  } catch (error) {
    console.error("Register Error:", error)

    res.status(500).json({
      message: "Something went wrong."
    })
  }
})

// LOGIN

app.post("/api/auth/login", async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body

    if (!email || !password) {
      return res.status(400).json({
        message: "Please enter your email and password."
      })
    }

    const user = db
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(email)

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password."
      })
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      )

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password."
      })
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      JWT_SECRET,
      {
        expiresIn: "1h"
      }
    )

    res.json({
      message: "Login successful!",
      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    })

  } catch (error) {
    console.error("Login Error:", error)

    res.status(500).json({
      message: "Something went wrong."
    })
  }
})

// ============================================================
// ASSIGNMENTS
// ============================================================

// GET

app.get(
  "/api/assignments",
  authenticateToken,
  (req, res) => {
    try {
      const assignments = db.prepare(`
        SELECT
          id,
          subject,
          title,
          due_date AS dueDate,
          completed
        FROM assignments
        WHERE user_id = ?
        ORDER BY due_date ASC
      `).all(req.user.id)

      res.json(
        assignments.map((assignment) => ({
          ...assignment,
          completed: Boolean(assignment.completed)
        }))
      )

    } catch (error) {
      console.error("Get Assignments Error:", error)

      res.status(500).json({
        message: "Could not load assignments."
      })
    }
  }
)

// ADD

app.post(
  "/api/assignments",
  authenticateToken,
  (req, res) => {
    try {
      const {
        subject,
        title,
        dueDate
      } = req.body

      if (!subject || !title || !dueDate) {
        return res.status(400).json({
          message: "Please fill in all assignment fields."
        })
      }

      const result = db.prepare(`
        INSERT INTO assignments
        (user_id, subject, title, due_date)
        VALUES (?, ?, ?, ?)
      `).run(
        req.user.id,
        subject,
        title,
        dueDate
      )

      db.prepare(`
        INSERT INTO notifications
        (user_id, type, title, message, time)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        req.user.id,
        "assignment",
        "New assignment added",
        `${title} for ${subject} has been added to your assignments.`,
        "Just now"
      )

      res.status(201).json({
        id: result.lastInsertRowid,
        subject,
        title,
        dueDate,
        completed: false
      })

    } catch (error) {
      console.error("Add Assignment Error:", error)

      res.status(500).json({
        message: "Could not add assignment."
      })
    }
  }
)

// UPDATE

app.put(
  "/api/assignments/:id",
  authenticateToken,
  (req, res) => {
    try {
      const { id } = req.params
      const { completed } = req.body

      const result = db.prepare(`
        UPDATE assignments
        SET completed = ?
        WHERE id = ?
        AND user_id = ?
      `).run(
        completed ? 1 : 0,
        id,
        req.user.id
      )

      if (result.changes === 0) {
        return res.status(404).json({
          message: "Assignment not found."
        })
      }

      res.json({
        message: "Assignment updated successfully."
      })

    } catch (error) {
      console.error("Update Assignment Error:", error)

      res.status(500).json({
        message: "Could not update assignment."
      })
    }
  }
)

// DELETE

app.delete(
  "/api/assignments/:id",
  authenticateToken,
  (req, res) => {
    try {
      const { id } = req.params

      const result = db.prepare(`
        DELETE FROM assignments
        WHERE id = ?
        AND user_id = ?
      `).run(
        id,
        req.user.id
      )

      if (result.changes === 0) {
        return res.status(404).json({
          message: "Assignment not found."
        })
      }

      res.json({
        message: "Assignment deleted successfully."
      })

    } catch (error) {
      console.error("Delete Assignment Error:", error)

      res.status(500).json({
        message: "Could not delete assignment."
      })
    }
  }
)

// ============================================================
// TIMETABLE
// ============================================================

// GET TIMETABLE

app.get(
  "/api/timetable",
  authenticateToken,
  (req, res) => {
    try {
      const classes = db.prepare(`
        SELECT
          id,
          subject,
          day,
          start_time AS startTime,
          end_time AS endTime,
          room,
          week_start AS weekStart
        FROM timetable
        WHERE user_id = ?
        ORDER BY
          week_start ASC,
          CASE day
            WHEN 'Monday' THEN 1
            WHEN 'Tuesday' THEN 2
            WHEN 'Wednesday' THEN 3
            WHEN 'Thursday' THEN 4
            WHEN 'Friday' THEN 5
            WHEN 'Saturday' THEN 6
            WHEN 'Sunday' THEN 7
          END,
          start_time
      `).all(req.user.id)

      res.json(classes)

    } catch (error) {
      console.error("Get Timetable Error:", error)

      res.status(500).json({
        message: "Could not load timetable."
      })
    }
  }
)

// ADD CLASS

app.post(
  "/api/timetable",
  authenticateToken,
  (req, res) => {
    try {
      const {
        subject,
        day,
        startTime,
        endTime,
        room,
        weekStart
      } = req.body

      if (
        !subject ||
        !day ||
        !startTime ||
        !endTime
      ) {
        return res.status(400).json({
          message: "Please fill in the required class fields."
        })
      }

      const result = db.prepare(`
        INSERT INTO timetable
        (
          user_id,
          subject,
          day,
          start_time,
          end_time,
          room,
          week_start
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        req.user.id,
        subject,
        day,
        startTime,
        endTime,
        room || "",
        weekStart || null
      )

      db.prepare(`
        INSERT INTO notifications
        (user_id, type, title, message, time)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        req.user.id,
        "timetable",
        "New class added",
        `${subject} has been added to your timetable.`,
        "Just now"
      )

      res.status(201).json({
        id: result.lastInsertRowid,
        subject,
        day,
        startTime,
        endTime,
        room: room || "",
        weekStart: weekStart || null
      })

    } catch (error) {
      console.error("Add Class Error:", error)

      res.status(500).json({
        message: "Could not add class."
      })
    }
  }
)

// DELETE CLASS

app.delete(
  "/api/timetable/:id",
  authenticateToken,
  (req, res) => {
    try {
      const { id } = req.params

      const result = db.prepare(`
        DELETE FROM timetable
        WHERE id = ?
        AND user_id = ?
      `).run(
        id,
        req.user.id
      )

      if (result.changes === 0) {
        return res.status(404).json({
          message: "Class not found."
        })
      }

      res.json({
        message: "Class deleted successfully."
      })

    } catch (error) {
      console.error("Delete Class Error:", error)

      res.status(500).json({
        message: "Could not delete class."
      })
    }
  }
)

// ============================================================
// IMPORT TIMETABLE
// ============================================================

function normalizeSubject(subject) {
  const value = subject.trim().toLowerCase()

  const subjects = {
    "chem": "Chemistry",
    "chemistry": "Chemistry",
    "che": "Chemistry",

    "cs": "Computer Science",
    "computer science": "Computer Science",

    "web": "Web Engineering",
    "web engineering": "Web Engineering",

    "se": "Software Engineering",
    "software engineering": "Software Engineering",

    "db": "Database",
    "database": "Database",
    "database systems": "Database Systems",

    "os": "Operating Systems",
    "operating systems": "Operating Systems",

    "cn": "Computer Networks",
    "computer networks": "Computer Networks",

    "ai": "Artificial Intelligence",
    "artificial intelligence": "Artificial Intelligence",

    "ml": "Machine Learning",
    "machine learning": "Machine Learning",

    "cyber": "Cyber Security",
    "cyber security": "Cyber Security",

    "dsa": "Data Structures",
    "data structures": "Data Structures",

    "oop": "Object Oriented Programming",
    "object oriented programming":
      "Object Oriented Programming"
  }

  return subjects[value] || subject.trim()
}

function convertTime(time) {
  if (!time) return null

  let value = time
    .trim()
    .toUpperCase()
    .replace(/(\d)\.(\d)/g, "$1:$2")
    .replace(/\./g, "")
    .replace(/(\d)(AM|PM)$/i, "$1 $2")

  const match = value.match(
    /^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/
  )

  if (!match) return null

  let hour = Number(match[1])
  const minute = match[2] || "00"
  const period = match[3]

  if (period === "PM" && hour !== 12) {
    hour += 12
  }

  if (period === "AM" && hour === 12) {
    hour = 0
  }

  return `${String(hour).padStart(2, "0")}:${minute}`
}

function parseDayName(value) {
  if (!value) return null

  const days = {
    monday: "Monday",
    mon: "Monday",

    tuesday: "Tuesday",
    tue: "Tuesday",
    tues: "Tuesday",

    wednesday: "Wednesday",
    wed: "Wednesday",

    thursday: "Thursday",
    thu: "Thursday",
    thur: "Thursday",
    thurs: "Thursday",

    friday: "Friday",
    fri: "Friday",

    saturday: "Saturday",
    sat: "Saturday",

    sunday: "Sunday",
    sun: "Sunday"
  }

  return days[String(value).trim().toLowerCase()] || null
}

function parseTimeRange(text) {
  if (!text) return null

  const match = String(text).match(
    /(\d{1,2}(?:[:.]\d{2})?\s*(?:AM|PM)?)\s*(?:-|–|—|to)\s*(\d{1,2}(?:[:.]\d{2})?\s*(?:AM|PM)?)/i
  )

  if (!match) return null

  const startTime = convertTime(match[1])
  const endTime = convertTime(match[2])

  if (!startTime || !endTime) return null

  return {
    startTime,
    endTime,
    full: match[0]
  }
}

function extractRoom(text) {
  if (!text) return ""

  const match = String(text).match(
    /\b(?:room|rm|lab)\s*[:.]?\s*([A-Za-z0-9-]+)/i
  )

  return match ? match[1] : ""
}

function parseTimetableText(text) {
  const detectedClasses = []

  if (!text || !String(text).trim()) {
    return detectedClasses
  }

  const lines = String(text)
    .split(/\r?\n/)
    .map((line) =>
      line
        .replace(/\|/g, " ")
        .replace(/\s+/g, " ")
        .trim()
    )
    .filter(Boolean)

  for (const line of lines) {
    const range = parseTimeRange(line)

    const dayMatch = line.match(
      /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun)\b/i
    )

    const day = dayMatch
      ? parseDayName(dayMatch[1])
      : null

    if (range && day) {
      let rest = line
        .replace(dayMatch[0], " ")
        .replace(range.full, " ")
        .replace(
          /\b(?:room|rm|lab)\s*[:.]?\s*[A-Za-z0-9-]+/i,
          " "
        )
        .replace(/[|,]/g, " ")
        .replace(/\s+/g, " ")
        .trim()

      if (rest.length >= 2 && !/^\d+$/.test(rest)) {
        detectedClasses.push({
          subject: normalizeSubject(rest),
          day,
          startTime: range.startTime,
          endTime: range.endTime,
          room: extractRoom(line)
        })
      }
    }
  }

  const uniqueClasses = []
  const seen = new Set()

  for (const classItem of detectedClasses) {
    const key = [
      classItem.day,
      classItem.startTime,
      classItem.endTime,
      classItem.subject,
      classItem.room
    ].join("|")

    if (seen.has(key)) continue

    seen.add(key)
    uniqueClasses.push(classItem)
  }

  console.log(
    "Parsed timetable classes:",
    uniqueClasses
  )

  return uniqueClasses
}

// IMPORT ROUTE

app.post(
  "/api/timetable/import",
  authenticateToken,
  upload.single("timetable"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message:
            "Please upload a timetable image or PDF."
        })
      }

      const allowedTypes = [
        "image/png",
        "image/jpeg",
        "image/jpg",
        "application/pdf"
      ]

      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          message:
            "Only PDF, PNG, JPG, and JPEG files are supported."
        })
      }

      let extractedText = ""

      if (req.file.mimetype === "application/pdf") {
        const parser = new PDFParse({
          data: new Uint8Array(
            fs.readFileSync(req.file.path)
          )
        })

        try {
          const pdfResult = await parser.getText()
          extractedText = pdfResult.text || ""
        } finally {
          await parser.destroy()
        }
      } else {
        const result = await Tesseract.recognize(
          req.file.path,
          "eng"
        )

        extractedText = result.data.text || ""
      }

      const detectedClasses =
        parseTimetableText(extractedText)

      res.json({
        message:
          detectedClasses.length > 0
            ? "Timetable classes detected successfully."
            : "The timetable was read, but no classes could be detected automatically.",

        text: extractedText,
        classes: detectedClasses
      })

    } catch (error) {
      console.error(
        "Import Timetable Error:",
        error
      )

      res.status(500).json({
        message: "Could not process the timetable."
      })
    }
  }
)

// ============================================================
// EXAMS
// ============================================================

app.get(
  "/api/exams",
  authenticateToken,
  (req, res) => {
    try {
      const exams = db.prepare(`
        SELECT id, subject, date, time, type
        FROM exams
        WHERE user_id = ?
        ORDER BY date ASC, time ASC
      `).all(req.user.id)

      res.json(exams)

    } catch (error) {
      console.error("Get Exams Error:", error)

      res.status(500).json({
        message: "Could not load exams."
      })
    }
  }
)

app.post(
  "/api/exams",
  authenticateToken,
  (req, res) => {
    try {
      const {
        subject,
        date,
        time,
        type
      } = req.body

      if (!subject || !date || !time || !type) {
        return res.status(400).json({
          message: "Please fill in all exam fields."
        })
      }

      const result = db.prepare(`
        INSERT INTO exams
        (user_id, subject, date, time, type)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        req.user.id,
        subject,
        date,
        time,
        type
      )

      db.prepare(`
        INSERT INTO notifications
        (user_id, type, title, message, time)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        req.user.id,
        "exam",
        "New exam added",
        `${subject} exam has been added to your exam schedule.`,
        date
      )

      res.status(201).json({
        id: result.lastInsertRowid,
        subject,
        date,
        time,
        type
      })

    } catch (error) {
      console.error("Add Exam Error:", error)

      res.status(500).json({
        message: "Could not add exam."
      })
    }
  }
)

app.delete(
  "/api/exams/:id",
  authenticateToken,
  (req, res) => {
    try {
      const { id } = req.params

      const result = db.prepare(`
        DELETE FROM exams
        WHERE id = ?
        AND user_id = ?
      `).run(id, req.user.id)

      if (result.changes === 0) {
        return res.status(404).json({
          message: "Exam not found."
        })
      }

      res.json({
        message: "Exam deleted successfully."
      })

    } catch (error) {
      console.error("Delete Exam Error:", error)

      res.status(500).json({
        message: "Could not delete exam."
      })
    }
  }
)

// ============================================================
// STUDY PLANNER
// ============================================================

// GET

app.get(
  "/api/study-sessions",
  authenticateToken,
  (req, res) => {
    try {
      const sessions = db.prepare(`
        SELECT
          id,
          subject,
          topic,
          date,
          time,
          duration,
          priority,
          completed
        FROM study_sessions
        WHERE user_id = ?
        ORDER BY date ASC, time ASC
      `).all(req.user.id)

      res.json(
        sessions.map((session) => ({
          ...session,
          completed: Boolean(session.completed)
        }))
      )

    } catch (error) {
      console.error(
        "Get Study Sessions Error:",
        error
      )

      res.status(500).json({
        message: "Could not load study sessions."
      })
    }
  }
)

// ADD

app.post(
  "/api/study-sessions",
  authenticateToken,
  (req, res) => {
    try {
      const {
        subject,
        topic,
        date,
        time,
        duration,
        priority
      } = req.body

      if (
        !subject ||
        !topic ||
        !date ||
        !time ||
        !duration ||
        !priority
      ) {
        return res.status(400).json({
          message:
            "Please fill in all study session fields."
        })
      }

      const result = db.prepare(`
        INSERT INTO study_sessions
        (
          user_id,
          subject,
          topic,
          date,
          time,
          duration,
          priority
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        req.user.id,
        subject,
        topic,
        date,
        time,
        Number(duration),
        priority
      )

      db.prepare(`
        INSERT INTO notifications
        (
          user_id,
          type,
          title,
          message,
          time
        )
        VALUES (?, ?, ?, ?, ?)
      `).run(
        req.user.id,
        "study",
        "Study session planned",
        `${subject} study session has been scheduled.`,
        date
      )

      res.status(201).json({
        id: result.lastInsertRowid,
        subject,
        topic,
        date,
        time,
        duration: Number(duration),
        priority,
        completed: false
      })

    } catch (error) {
      console.error(
        "Add Study Session Error:",
        error
      )

      res.status(500).json({
        message: "Could not add study session."
      })
    }
  }
)

// UPDATE

app.put(
  "/api/study-sessions/:id",
  authenticateToken,
  (req, res) => {
    try {
      const { id } = req.params
      const { completed } = req.body

      const result = db.prepare(`
        UPDATE study_sessions
        SET completed = ?
        WHERE id = ?
        AND user_id = ?
      `).run(
        completed ? 1 : 0,
        id,
        req.user.id
      )

      if (result.changes === 0) {
        return res.status(404).json({
          message: "Study session not found."
        })
      }

      res.json({
        message:
          "Study session updated successfully."
      })

    } catch (error) {
      console.error(
        "Update Study Session Error:",
        error
      )

      res.status(500).json({
        message: "Could not update study session."
      })
    }
  }
)

// DELETE

app.delete(
  "/api/study-sessions/:id",
  authenticateToken,
  (req, res) => {
    try {
      const { id } = req.params

      const result = db.prepare(`
        DELETE FROM study_sessions
        WHERE id = ?
        AND user_id = ?
      `).run(
        id,
        req.user.id
      )

      if (result.changes === 0) {
        return res.status(404).json({
          message: "Study session not found."
        })
      }

      res.json({
        message:
          "Study session deleted successfully."
      })

    } catch (error) {
      console.error(
        "Delete Study Session Error:",
        error
      )

      res.status(500).json({
        message: "Could not delete study session."
      })
    }
  }
)

// ============================================================
// CAREER GOALS
// ============================================================

const careerMilestones = {

  "Full Stack Developer": [
    "Learn HTML",
    "Learn CSS",
    "Learn JavaScript",
    "Learn React",
    "Learn Node.js",
    "Learn Express.js",
    "Learn Databases",
    "Learn REST APIs",
    "Learn Authentication & Authorization",
    "Learn Git & GitHub",
    "Build a Full Stack Project",
    "Deploy the Project"
  ],

  "Frontend Developer": [
    "Learn HTML",
    "Learn CSS",
    "Learn JavaScript",
    "Learn Responsive Design",
    "Learn Git & GitHub",
    "Learn React",
    "Learn React Router",
    "Learn API Integration",
    "Build Frontend Projects",
    "Deploy Projects"
  ],

  "Backend Developer": [
    "Learn JavaScript",
    "Learn Node.js",
    "Learn Express.js",
    "Learn REST APIs",
    "Learn Databases",
    "Learn SQL",
    "Learn Authentication & Authorization",
    "Learn JWT",
    "Learn Git & GitHub",
    "Build Backend Projects",
    "Deploy Backend Applications"
  ],

  "Software Engineer": [
    "Learn Programming Fundamentals",
    "Learn Data Structures",
    "Learn Algorithms",
    "Learn Object-Oriented Programming",
    "Learn Git & GitHub",
    "Learn Databases",
    "Learn Software Design",
    "Learn APIs",
    "Practice Problem Solving",
    "Build Software Projects",
    "Build a Final Portfolio Project"
  ],

  "Data Scientist": [
    "Learn Python",
    "Learn Statistics",
    "Learn NumPy",
    "Learn Pandas",
    "Learn Data Visualization",
    "Learn SQL",
    "Learn Machine Learning",
    "Learn Data Cleaning",
    "Work With Real Datasets",
    "Build Data Science Projects",
    "Create a Data Science Portfolio"
  ],

  "Machine Learning Engineer": [
    "Learn Python",
    "Learn NumPy & Pandas",
    "Learn Mathematics for ML",
    "Learn Statistics",
    "Learn Machine Learning",
    "Learn Scikit-learn",
    "Learn Deep Learning",
    "Learn Model Evaluation",
    "Learn APIs & Deployment",
    "Build ML Projects",
    "Deploy an ML Model"
  ],

  "Cyber Security Specialist": [
    "Learn Computer Networks",
    "Learn Linux",
    "Learn Operating Systems",
    "Learn Cyber Security Fundamentals",
    "Learn Cryptography Basics",
    "Learn Web Security",
    "Learn Ethical Hacking Concepts",
    "Learn Security Tools",
    "Practice in Safe Labs",
    "Build Security Projects",
    "Create a Cyber Security Portfolio"
  ],

  "Mobile App Developer": [
    "Learn Programming Fundamentals",
    "Learn Git & GitHub",
    "Learn Mobile UI Design",
    "Learn Android/iOS Development",
    "Learn APIs",
    "Learn Databases",
    "Learn Authentication",
    "Build a Mobile App",
    "Test the Application",
    "Publish the Application"
  ]
}

// GET CAREER GOALS

app.get(
  "/api/career-goals",
  authenticateToken,
  (req, res) => {
    try {
      const goals = db.prepare(`
        SELECT
          id,
          title,
          category,
          deadline
        FROM career_goals
        WHERE user_id = ?
        ORDER BY id DESC
      `).all(req.user.id)

      const formattedGoals =
        goals.map((goal) => {

          const milestones =
            db.prepare(`
              SELECT
                id,
                name,
                completed
              FROM goal_milestones
              WHERE goal_id = ?
              ORDER BY id ASC
            `).all(goal.id)

          return {
            ...goal,
            skills: [],
            milestones:
              milestones.map(
                (milestone) => ({
                  ...milestone,
                  completed:
                    Boolean(milestone.completed)
                })
              )
          }
        })

      res.json(formattedGoals)

    } catch (error) {
      console.error(
        "Get Career Goals Error:",
        error
      )

      res.status(500).json({
        message: "Could not load career goals."
      })
    }
  }
)

// ADD CAREER GOAL

app.post(
  "/api/career-goals",
  authenticateToken,
  (req, res) => {
    try {
      const {
        title,
        category,
        deadline
      } = req.body

      if (!title || !category || !deadline) {
        return res.status(400).json({
          message: "Please fill in all goal fields."
        })
      }

      const result = db.prepare(`
        INSERT INTO career_goals
        (
          user_id,
          title,
          category,
          deadline
        )
        VALUES (?, ?, ?, ?)
      `).run(
        req.user.id,
        title,
        category,
        deadline
      )

      const goalId = result.lastInsertRowid

      let milestones =
        careerMilestones[title]

      if (!milestones) {
        milestones = [
          "Research the career",
          "Learn the fundamentals",
          "Learn the required tools",
          "Learn industry skills",
          "Practice through projects",
          "Build a portfolio",
          "Create a professional profile",
          "Apply for internships or jobs"
        ]
      }

      const insertMilestone =
        db.prepare(`
          INSERT INTO goal_milestones
          (
            goal_id,
            name,
            completed
          )
          VALUES (?, ?, ?)
        `)

      const milestoneIds = []

      const transaction =
        db.transaction(() => {
          for (const milestone of milestones) {
            const milestoneResult =
              insertMilestone.run(
                goalId,
                milestone,
                0
              )

            milestoneIds.push(
              milestoneResult.lastInsertRowid
            )
          }
        })

      transaction()

      db.prepare(`
        INSERT INTO notifications
        (
          user_id,
          type,
          title,
          message,
          time
        )
        VALUES (?, ?, ?, ?, ?)
      `).run(
        req.user.id,
        "career",
        "New career goal added",
        `${title} has been added to your career goals.`,
        "Just now"
      )

      res.status(201).json({
        id: goalId,
        title,
        category,
        deadline,
        skills: [],

        milestones:
          milestones.map((name, index) => ({
            id: milestoneIds[index],
            name,
            completed: false
          }))
      })

    } catch (error) {
      console.error(
        "Add Career Goal Error:",
        error
      )

      res.status(500).json({
        message: "Could not add career goal."
      })
    }
  }
)

// UPDATE MILESTONE

app.put(
  "/api/career-goals/:goalId/milestones/:milestoneId",
  authenticateToken,
  (req, res) => {
    try {
      const {
        goalId,
        milestoneId
      } = req.params

      const { completed } = req.body

      const goal = db.prepare(`
        SELECT id
        FROM career_goals
        WHERE id = ?
        AND user_id = ?
      `).get(
        goalId,
        req.user.id
      )

      if (!goal) {
        return res.status(404).json({
          message: "Career goal not found."
        })
      }

      const result = db.prepare(`
        UPDATE goal_milestones
        SET completed = ?
        WHERE id = ?
        AND goal_id = ?
      `).run(
        completed ? 1 : 0,
        milestoneId,
        goalId
      )

      if (result.changes === 0) {
        return res.status(404).json({
          message: "Milestone not found."
        })
      }

      res.json({
        message:
          "Milestone updated successfully."
      })

    } catch (error) {
      console.error(
        "Update Milestone Error:",
        error
      )

      res.status(500).json({
        message: "Could not update milestone."
      })
    }
  }
)

// DELETE CAREER GOAL

app.delete(
  "/api/career-goals/:id",
  authenticateToken,
  (req, res) => {
    try {
      const { id } = req.params

      const goal = db.prepare(`
        SELECT id
        FROM career_goals
        WHERE id = ?
        AND user_id = ?
      `).get(
        id,
        req.user.id
      )

      if (!goal) {
        return res.status(404).json({
          message: "Career goal not found."
        })
      }

      db.prepare(`
        DELETE FROM goal_milestones
        WHERE goal_id = ?
      `).run(id)

      db.prepare(`
        DELETE FROM career_goals
        WHERE id = ?
        AND user_id = ?
      `).run(
        id,
        req.user.id
      )

      res.json({
        message:
          "Career goal deleted successfully."
      })

    } catch (error) {
      console.error(
        "Delete Career Goal Error:",
        error
      )

      res.status(500).json({
        message: "Could not delete career goal."
      })
    }
  }
)

// ============================================================
// SKILL ROADMAP
// ============================================================

app.get(
  "/api/skill-roadmap",
  authenticateToken,
  (req, res) => {
    try {
      const career =
        req.query.career ||
        "Full Stack Developer"

      const skills = db.prepare(`
        SELECT
          skill_id AS id,
          skill_name AS name,
          category,
          progress,
          status
        FROM skill_roadmaps
        WHERE user_id = ?
        AND career = ?
        ORDER BY skill_id ASC
      `).all(
        req.user.id,
        career
      )

      res.json({
        career,
        skills
      })

    } catch (error) {
      console.error(
        "Get Skill Roadmap Error:",
        error
      )

      res.status(500).json({
        message: "Could not load skill roadmap."
      })
    }
  }
)

app.post(
  "/api/skill-roadmap",
  authenticateToken,
  (req, res) => {
    try {
      const {
        career,
        skills
      } = req.body

      if (
        !career ||
        !Array.isArray(skills)
      ) {
        return res.status(400).json({
          message:
            "Career and skills are required."
        })
      }

      const insertSkill = db.prepare(`
        INSERT INTO skill_roadmaps
        (
          user_id,
          career,
          skill_id,
          skill_name,
          category,
          progress,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)

        ON CONFLICT(user_id, career, skill_id)
        DO UPDATE SET
          skill_name = excluded.skill_name,
          category = excluded.category,
          progress = excluded.progress,
          status = excluded.status
      `)

      const transaction =
        db.transaction(() => {
          for (const skill of skills) {
            insertSkill.run(
              req.user.id,
              career,
              skill.id,
              skill.name,
              skill.category,
              Number(skill.progress) || 0,
              skill.status || "Next"
            )
          }
        })

      transaction()

      const savedSkills = db.prepare(`
        SELECT
          skill_id AS id,
          skill_name AS name,
          category,
          progress,
          status
        FROM skill_roadmaps
        WHERE user_id = ?
        AND career = ?
        ORDER BY skill_id ASC
      `).all(
        req.user.id,
        career
      )

      res.status(201).json({
        career,
        skills: savedSkills
      })

    } catch (error) {
      console.error(
        "Save Skill Roadmap Error:",
        error
      )

      res.status(500).json({
        message: "Could not save skill roadmap."
      })
    }
  }
)

app.put(
  "/api/skill-roadmap/:career/:skillId",
  authenticateToken,
  (req, res) => {
    try {
      const {
        career,
        skillId
      } = req.params

      const {
        progress,
        status
      } = req.body

      const decodedCareer =
        decodeURIComponent(career)

      const skill = db.prepare(`
        SELECT *
        FROM skill_roadmaps
        WHERE user_id = ?
        AND career = ?
        AND skill_id = ?
      `).get(
        req.user.id,
        decodedCareer,
        skillId
      )

      if (!skill) {
        return res.status(404).json({
          message: "Skill was not found."
        })
      }

      let newProgress =
        Number(progress)

      if (
        Number.isNaN(newProgress) ||
        newProgress < 0
      ) {
        newProgress = skill.progress
      }

      newProgress =
        Math.min(newProgress, 100)

      let newStatus = status

      if (!newStatus) {
        if (newProgress === 100) {
          newStatus = "Completed"
        } else if (newProgress > 0) {
          newStatus = "In Progress"
        } else {
          newStatus = "Next"
        }
      }

      db.prepare(`
        UPDATE skill_roadmaps
        SET
          progress = ?,
          status = ?
        WHERE user_id = ?
        AND career = ?
        AND skill_id = ?
      `).run(
        newProgress,
        newStatus,
        req.user.id,
        decodedCareer,
        skillId
      )

      res.json({
        message:
          "Skill progress updated successfully.",
        id: Number(skillId),
        progress: newProgress,
        status: newStatus
      })

    } catch (error) {
      console.error(
        "Update Skill Roadmap Error:",
        error
      )

      res.status(500).json({
        message:
          "Could not update skill progress."
      })
    }
  }
)

// ============================================================
// CAREER EXPLORATION
// ============================================================

app.get(
  "/api/careers",
  authenticateToken,
  async (req, res) => {
    try {
      const search = req.query.search

      if (!search) {
        return res.status(400).json({
          message:
            "Please provide a career search."
        })
      }

      const url =
        `https://ec.europa.eu/esco/api/search?` +
        `text=${encodeURIComponent(search)}` +
        `&type=occupation` +
        `&limit=5`

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(
          `ESCO request failed: ${response.status}`
        )
      }

      const data = await response.json()

      res.json(data)

    } catch (error) {
      console.error(
        "Career API Error:",
        error
      )

      res.status(500).json({
        message:
          "Could not load career information."
      })
    }
  }
)

// ============================================================
// ANALYTICS
// ============================================================

app.get(
  "/api/analytics",
  authenticateToken,
  (req, res) => {
    try {
      const userId = req.user.id

      const assignmentStats = db.prepare(`
        SELECT
          COUNT(*) AS total,
          SUM(
            CASE
              WHEN completed = 1 THEN 1
              ELSE 0
            END
          ) AS completed
        FROM assignments
        WHERE user_id = ?
      `).get(userId)

      const examStats = db.prepare(`
        SELECT COUNT(*) AS total
        FROM exams
        WHERE user_id = ?
      `).get(userId)

      const timetableStats = db.prepare(`
        SELECT COUNT(*) AS total
        FROM timetable
        WHERE user_id = ?
      `).get(userId)

      const studyStats = db.prepare(`
        SELECT
          COUNT(*) AS total,

          SUM(
            CASE
              WHEN completed = 1 THEN 1
              ELSE 0
            END
          ) AS completed,

          COALESCE(
            SUM(duration),
            0
          ) AS totalMinutes

        FROM study_sessions
        WHERE user_id = ?
      `).get(userId)

      const subjectStats = db.prepare(`
        SELECT
          subject,
          COUNT(*) AS count
        FROM assignments
        WHERE user_id = ?
        GROUP BY subject
        ORDER BY count DESC
      `).all(userId)

      const studySubjectStats = db.prepare(`
        SELECT
          subject,
          SUM(duration) AS minutes
        FROM study_sessions
        WHERE user_id = ?
        GROUP BY subject
        ORDER BY minutes DESC
      `).all(userId)

      const assignmentTotal =
        assignmentStats.total || 0

      const assignmentCompleted =
        assignmentStats.completed || 0

      const studyTotal =
        studyStats.total || 0

      const studyCompleted =
        studyStats.completed || 0

      const assignmentProgress =
        assignmentTotal === 0
          ? 0
          : Math.round(
              (assignmentCompleted /
                assignmentTotal) * 100
            )

      const studyProgress =
        studyTotal === 0
          ? 0
          : Math.round(
              (studyCompleted /
                studyTotal) * 100
            )

      const now = new Date()

      const dayOfWeek = now.getDay()

      const mondayOffset =
        dayOfWeek === 0
          ? -6
          : 1 - dayOfWeek

      const monday = new Date(now)

      monday.setDate(
        now.getDate() + mondayOffset
      )

      monday.setHours(0, 0, 0, 0)

      const sunday = new Date(monday)

      sunday.setDate(
        monday.getDate() + 6
      )

      sunday.setHours(
        23,
        59,
        59,
        999
      )

      const formatDate = (date) => {
        const year = date.getFullYear()

        const month = String(
          date.getMonth() + 1
        ).padStart(2, "0")

        const day = String(
          date.getDate()
        ).padStart(2, "0")

        return `${year}-${month}-${day}`
      }

      const mondayDate =
        formatDate(monday)

      const sundayDate =
        formatDate(sunday)

      const studySessionsForWeek =
        db.prepare(`
          SELECT
            date,
            duration
          FROM study_sessions
          WHERE user_id = ?
          AND date >= ?
          AND date <= ?
        `).all(
          userId,
          mondayDate,
          sundayDate
        )

      const weekDayLabels = [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun"
      ]

      const weeklyMinutes = [
        0,
        0,
        0,
        0,
        0,
        0,
        0
      ]

      for (
        const session of studySessionsForWeek
      ) {
        if (!session.date) continue

        const date = new Date(
          `${session.date}T00:00:00`
        )

        if (Number.isNaN(date.getTime())) {
          continue
        }

        const jsDay = date.getDay()

        const mondayIndex =
          jsDay === 0
            ? 6
            : jsDay - 1

        weeklyMinutes[mondayIndex] +=
          Number(session.duration || 0)
      }

      const weeklyStudy =
        weekDayLabels.map(
          (day, index) => ({
            day,
            hours: Number(
              (
                weeklyMinutes[index] / 60
              ).toFixed(1)
            )
          })
        )

      res.json({

        assignments: {
          total: assignmentTotal,
          completed: assignmentCompleted,
          pending:
            assignmentTotal -
            assignmentCompleted,
          progress: assignmentProgress
        },

        exams: {
          total:
            examStats.total || 0
        },

        timetable: {
          total:
            timetableStats.total || 0
        },

        study: {
          total: studyTotal,
          completed: studyCompleted,
          pending:
            studyTotal -
            studyCompleted,
          totalMinutes:
            studyStats.totalMinutes || 0,
          progress: studyProgress
        },

        assignmentSubjects:
          subjectStats,

        studySubjects:
          studySubjectStats,

        weeklyStudy
      })

    } catch (error) {
      console.error(
        "Analytics Error:",
        error
      )

      res.status(500).json({
        message:
          "Could not load analytics."
      })
    }
  }
)

// ============================================================
// NOTIFICATIONS
// ============================================================

// GET

app.get(
  "/api/notifications",
  authenticateToken,
  (req, res) => {
    try {
      const notifications =
        db.prepare(`
          SELECT
            id,
            type,
            title,
            message,
            time,
            read
          FROM notifications
          WHERE user_id = ?
          ORDER BY id DESC
        `).all(req.user.id)

      const formattedNotifications =
        notifications.map(
          (notification) => ({
            ...notification,
            read:
              Boolean(notification.read)
          })
        )

      res.json(formattedNotifications)

    } catch (error) {
      console.error(
        "Get Notifications Error:",
        error
      )

      res.status(500).json({
        message:
          "Could not load notifications."
      })
    }
  }
)

// ADD

app.post(
  "/api/notifications",
  authenticateToken,
  (req, res) => {
    try {
      const {
        type,
        title,
        message,
        time
      } = req.body

      if (
        !type ||
        !title ||
        !message ||
        !time
      ) {
        return res.status(400).json({
          message:
            "Please fill in all notification fields."
        })
      }

      const result = db.prepare(`
        INSERT INTO notifications
        (
          user_id,
          type,
          title,
          message,
          time
        )
        VALUES (?, ?, ?, ?, ?)
      `).run(
        req.user.id,
        type,
        title,
        message,
        time
      )

      res.status(201).json({
        id: result.lastInsertRowid,
        type,
        title,
        message,
        time,
        read: false
      })

    } catch (error) {
      console.error(
        "Add Notification Error:",
        error
      )

      res.status(500).json({
        message:
          "Could not add notification."
      })
    }
  }
)

// MARK ALL AS READ

app.put(
  "/api/notifications/read-all",
  authenticateToken,
  (req, res) => {
    try {
      db.prepare(`
        UPDATE notifications
        SET read = 1
        WHERE user_id = ?
      `).run(req.user.id)

      res.json({
        message:
          "All notifications marked as read."
      })

    } catch (error) {
      console.error(
        "Mark All Notifications Error:",
        error
      )

      res.status(500).json({
        message:
          "Could not update notifications."
      })
    }
  }
)

// MARK ONE AS READ

app.put(
  "/api/notifications/:id",
  authenticateToken,
  (req, res) => {
    try {
      const { id } = req.params

      const result = db.prepare(`
        UPDATE notifications
        SET read = 1
        WHERE id = ?
        AND user_id = ?
      `).run(
        id,
        req.user.id
      )

      if (result.changes === 0) {
        return res.status(404).json({
          message:
            "Notification not found."
        })
      }

      res.json({
        message:
          "Notification marked as read."
      })

    } catch (error) {
      console.error(
        "Update Notification Error:",
        error
      )

      res.status(500).json({
        message:
          "Could not update notification."
      })
    }
  }
)

// DELETE ONE

app.delete(
  "/api/notifications/:id",
  authenticateToken,
  (req, res) => {
    try {
      const { id } = req.params

      const result = db.prepare(`
        DELETE FROM notifications
        WHERE id = ?
        AND user_id = ?
      `).run(
        id,
        req.user.id
      )

      if (result.changes === 0) {
        return res.status(404).json({
          message:
            "Notification not found."
        })
      }

      res.json({
        message:
          "Notification deleted successfully."
      })

    } catch (error) {
      console.error(
        "Delete Notification Error:",
        error
      )

      res.status(500).json({
        message:
          "Could not delete notification."
      })
    }
  }
)

// CLEAR ALL

app.delete(
  "/api/notifications",
  authenticateToken,
  (req, res) => {
    try {
      db.prepare(`
        DELETE FROM notifications
        WHERE user_id = ?
      `).run(req.user.id)

      res.json({
        message:
          "All notifications cleared."
      })

    } catch (error) {
      console.error(
        "Clear Notifications Error:",
        error
      )

      res.status(500).json({
        message:
          "Could not clear notifications."
      })
    }
  }
)

// ============================================================
// START SERVER
// ============================================================

app.listen(
  PORT,
  () => {
    console.log(
      `UniPilot server running on http://localhost:${PORT}`
    )
  }
)