import { BrowserRouter, Routes, Route } from "react-router-dom"

import App from "./App"

import Login from "./pages/Login"
import Register from "./pages/Register"

import Features from "./pages/Features"
import About from "./pages/About"

import Dashboard from "./pages/Dashboard"
import Timetable from "./pages/Timetable"
import Assignments from "./pages/Assignments"
import Exams from "./pages/Exams"
import StudyPlanner from "./pages/StudyPlanner"
import SkillRoadmap from "./pages/SkillRoadmap"
import CareerGoals from "./pages/CareerGoals"
import Analytics from "./pages/Analytics"
import Notifications from "./pages/Notifications"

import DashboardLayout from "./pages/Components/DashboardLayout"
import ProtectedRoute from "./pages/Components/ProtectedRoute"


// ==========================================
// ROUTER
// ==========================================

function Router() {
  return (
    <BrowserRouter>

      <Routes>

        {/* ==================================
            PUBLIC PAGES
        ================================== */}

        <Route
          path="/"
          element={<App />}
        />

        <Route
          path="/features"
          element={<Features />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* ==================================
            PROTECTED UNIVERSITY APP
        ================================== */}

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/timetable"
            element={<Timetable />}
          />

          <Route
            path="/assignments"
            element={<Assignments />}
          />

          <Route
            path="/exams"
            element={<Exams />}
          />

          <Route
            path="/study-planner"
            element={<StudyPlanner />}
          />

          <Route
            path="/skill-roadmap"
            element={<SkillRoadmap />}
          />

          <Route
            path="/career-goals"
            element={<CareerGoals />}
          />

          <Route
            path="/analytics"
            element={<Analytics />}
          />

          <Route
            path="/notifications"
            element={<Notifications />}
          />

          </Route>
        </Route>

      </Routes>

    </BrowserRouter>
  )
}

export default Router