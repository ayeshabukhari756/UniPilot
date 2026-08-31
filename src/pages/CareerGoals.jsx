import { useEffect, useMemo, useState } from "react"
import "./CareerGoals.css"

const API_URL = "http://localhost:5000"

function getAuthHeaders() {
  const token = localStorage.getItem("token")

  return {
    "Content-Type": "application/json",
    ...(token
      ? { Authorization: `Bearer ${token}` }
      : {}),
  }
}

const careerLibrary = [
  {
    name: "Web Developer",
    category: "Technology",
    description:
      "Build websites and web applications using frontend and backend technologies.",
    parts: [
      "HTML and semantic structure",
      "CSS and responsive design",
      "JavaScript",
      "Frontend frameworks",
      "APIs",
      "Backend development",
      "Databases",
      "Deployment",
    ],
    skills: [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "APIs",
      "Git",
      "Responsive Design",
    ],
    milestones: [
      "Learn HTML fundamentals",
      "Learn CSS and responsive design",
      "Learn JavaScript fundamentals",
      "Build interactive web pages",
      "Learn React",
      "Learn APIs and backend basics",
      "Build complete web projects",
      "Create a portfolio",
      "Apply for internships or junior roles",
    ],
  },

  {
    name: "Full Stack Developer",
    category: "Technology",
    description:
      "Build complete web applications by working with both frontend and backend technologies.",
    parts: [
      "Frontend development",
      "Backend development",
      "Databases",
      "REST APIs",
      "Authentication",
      "Testing",
      "Git and collaboration",
      "Deployment",
    ],
    skills: [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Node.js",
      "Express",
      "Databases",
      "REST APIs",
      "Git",
    ],
    milestones: [
      "Learn HTML fundamentals",
      "Learn CSS and responsive design",
      "Master JavaScript fundamentals",
      "Build interactive frontend projects",
      "Learn React",
      "Learn Node.js and Express",
      "Learn databases and SQL",
      "Build REST APIs",
      "Learn authentication and authorization",
      "Connect frontend with backend",
      "Build a complete full-stack project",
      "Deploy your application",
      "Create a professional portfolio",
      "Apply for internships or junior developer roles",
    ],
  },

  {
    name: "Software Developer",
    category: "Technology",
    description:
      "Design, build, test, and maintain software applications.",
    parts: [
      "Programming fundamentals",
      "Problem solving",
      "Software development",
      "Databases",
      "APIs",
      "Testing",
      "Version control",
      "Deployment",
    ],
    skills: [
      "Programming",
      "Problem Solving",
      "JavaScript",
      "Git",
      "Databases",
      "Testing",
      "APIs",
    ],
    milestones: [
      "Learn programming fundamentals",
      "Practice problem solving",
      "Build small programming projects",
      "Learn software development concepts",
      "Learn databases",
      "Learn APIs",
      "Learn Git and collaboration",
      "Build a complete application",
      "Create a portfolio",
      "Apply for internships or entry-level roles",
    ],
  },

  {
    name: "Frontend Developer",
    category: "Technology",
    description:
      "Create the user-facing part of websites and applications with modern frontend technologies.",
    parts: [
      "HTML",
      "CSS",
      "JavaScript",
      "Responsive design",
      "UI development",
      "React",
      "APIs",
      "Frontend deployment",
    ],
    skills: [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Responsive Design",
      "Git",
      "UI Development",
    ],
    milestones: [
      "Learn HTML",
      "Learn CSS",
      "Build responsive layouts",
      "Learn JavaScript",
      "Build interactive websites",
      "Learn React",
      "Work with APIs",
      "Build frontend projects",
      "Create a portfolio",
      "Apply for frontend internships",
    ],
  },

  {
    name: "Backend Developer",
    category: "Technology",
    description:
      "Build server-side applications, APIs, authentication systems, and database-driven services.",
    parts: [
      "Programming",
      "Servers",
      "APIs",
      "Databases",
      "Authentication",
      "Security",
      "Testing",
      "Deployment",
    ],
    skills: [
      "Node.js",
      "Express",
      "JavaScript",
      "REST APIs",
      "SQL",
      "Databases",
      "Authentication",
      "Git",
    ],
    milestones: [
      "Learn programming fundamentals",
      "Learn Node.js",
      "Learn Express",
      "Build REST APIs",
      "Learn databases",
      "Connect applications to databases",
      "Implement authentication",
      "Build a backend project",
      "Deploy an API",
      "Create a backend portfolio",
    ],
  },

  {
    name: "Data Scientist",
    category: "Technology & Science",
    description:
      "Use data, statistics, and computing to discover insights and solve real-world problems.",
    parts: [
      "Statistics",
      "Data analysis",
      "Programming",
      "Data visualization",
      "Machine learning",
      "Databases",
      "Research",
      "Communication",
    ],
    skills: [
      "Python",
      "Statistics",
      "Data Analysis",
      "Machine Learning",
      "Research",
      "Visualization",
    ],
    milestones: [
      "Learn Python fundamentals",
      "Learn statistics",
      "Learn data analysis",
      "Practice with real datasets",
      "Learn data visualization",
      "Learn machine learning",
      "Complete data projects",
      "Build a data portfolio",
      "Apply for internships",
    ],
  },

  {
    name: "Graphic Designer",
    category: "Design",
    description:
      "Create visual concepts for digital and physical communication.",
    parts: [
      "Design principles",
      "Typography",
      "Color theory",
      "Branding",
      "Digital design",
      "Portfolio development",
      "Client communication",
      "Creative problem solving",
    ],
    skills: [
      "Creativity",
      "Typography",
      "Visual Design",
      "Branding",
      "Communication",
      "Design Software",
    ],
    milestones: [
      "Learn design fundamentals",
      "Learn typography",
      "Learn color theory",
      "Practice layouts",
      "Learn design tools",
      "Create branding projects",
      "Build a portfolio",
      "Complete client-style projects",
      "Apply for opportunities",
    ],
  },

  {
    name: "Marketing Specialist",
    category: "Business & Marketing",
    description:
      "Help organizations understand audiences and promote products, services, or ideas.",
    parts: [
      "Marketing fundamentals",
      "Consumer behavior",
      "Content",
      "Digital marketing",
      "Market research",
      "Branding",
      "Analytics",
      "Communication",
    ],
    skills: [
      "Communication",
      "Creativity",
      "Research",
      "Analytics",
      "Content Creation",
      "Strategy",
    ],
    milestones: [
      "Learn marketing fundamentals",
      "Study consumer behavior",
      "Practice content creation",
      "Learn digital marketing",
      "Learn market research",
      "Run a small campaign",
      "Build a marketing portfolio",
      "Gain practical experience",
    ],
  },

  {
    name: "Business Manager",
    category: "Business",
    description:
      "Plan, organize, and manage people, projects, and business operations.",
    parts: [
      "Business strategy",
      "Leadership",
      "Finance",
      "Marketing",
      "Operations",
      "Communication",
      "Decision making",
      "Project management",
    ],
    skills: [
      "Leadership",
      "Communication",
      "Planning",
      "Finance",
      "Negotiation",
      "Decision Making",
    ],
    milestones: [
      "Learn business fundamentals",
      "Develop communication skills",
      "Learn basic finance",
      "Learn project management",
      "Work on a team project",
      "Gain practical experience",
      "Develop a professional network",
    ],
  },
]

function CareerGoals() {
  const [goals, setGoals] = useState([])

  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("Career")
  const [deadline, setDeadline] = useState("")

  const [loadingGoals, setLoadingGoals] = useState(true)
  const [goalError, setGoalError] = useState("")

  const [careerSearch, setCareerSearch] = useState("")
  const [selectedCareer, setSelectedCareer] = useState(null)

  const [completedRoadmaps, setCompletedRoadmaps] = useState({})

  useEffect(() => {
    loadGoals()
  }, [])

  async function loadGoals() {
    try {
      setLoadingGoals(true)
      setGoalError("")

      const response = await fetch(
        `${API_URL}/api/career-goals`,
        {
          headers: getAuthHeaders(),
        }
      )

      if (!response.ok) {
        throw new Error("Could not load goals")
      }

      const data = await response.json()

      setGoals(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)

      setGoalError(
        "Could not load your career goals."
      )
    } finally {
      setLoadingGoals(false)
    }
  }

  async function addGoal(e) {
    e.preventDefault()

    if (!title.trim() || !deadline.trim()) {
      setGoalError(
        "Please enter a goal and target year."
      )
      return
    }

    try {
      setGoalError("")

      const response = await fetch(
        `${API_URL}/api/career-goals`,
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            title: title.trim(),
            category,
            deadline: deadline.trim(),
          }),
        }
      )

      if (!response.ok) {
        throw new Error("Could not add goal")
      }

      const newGoal = await response.json()

      /*
        If the backend already returns milestones,
        keep them.

        If it returns only one/empty milestone,
        the frontend uses the matching career roadmap.
      */

      const matchingCareer = careerLibrary.find(
        (career) =>
          career.name.toLowerCase() ===
          title.trim().toLowerCase()
      )

      if (
        matchingCareer &&
        (!newGoal.milestones ||
          newGoal.milestones.length < 2)
      ) {
        newGoal.milestones =
          matchingCareer.milestones.map(
            (name, index) => ({
              id: `local-${newGoal.id}-${index}`,
              name,
              completed: false,
            })
          )
      }

      setGoals((currentGoals) => [
        ...currentGoals,
        newGoal,
      ])

      setTitle("")
      setCategory("Career")
      setDeadline("")

      document
        .querySelector(".goals-section")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
    } catch (error) {
      console.error(error)

      setGoalError(
        "Could not add your career goal."
      )
    }
  }

  async function toggleMilestone(
    goalId,
    milestoneId
  ) {
    const goal = goals.find(
      (item) => item.id === goalId
    )

    if (!goal) return

    const milestone = goal.milestones?.find(
      (item) => item.id === milestoneId
    )

    if (!milestone) return

    const newCompleted =
      !milestone.completed

    /*
      Local roadmap milestones are also supported.
      Their IDs begin with "local-".
    */

    if (
      typeof milestoneId === "string" &&
      milestoneId.startsWith("local-")
    ) {
      setGoals((currentGoals) =>
        currentGoals.map((item) => {
          if (item.id !== goalId) {
            return item
          }

          return {
            ...item,
            milestones:
              item.milestones.map((m) =>
                m.id === milestoneId
                  ? {
                      ...m,
                      completed: newCompleted,
                    }
                  : m
              ),
          }
        })
      )

      return
    }

    try {
      const response = await fetch(
        `${API_URL}/api/career-goals/${goalId}/milestones/${milestoneId}`,
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
          "Could not update milestone"
        )
      }

      setGoals((currentGoals) =>
        currentGoals.map((item) => {
          if (item.id !== goalId) {
            return item
          }

          return {
            ...item,
            milestones:
              item.milestones?.map((m) =>
                m.id === milestoneId
                  ? {
                      ...m,
                      completed: newCompleted,
                    }
                  : m
              ) || [],
          }
        })
      )
    } catch (error) {
      console.error(error)
    }
  }

  async function deleteGoal(id) {
    try {
      const response = await fetch(
        `${API_URL}/api/career-goals/${id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      )

      if (!response.ok) {
        throw new Error(
          "Could not delete goal"
        )
      }

      setGoals((currentGoals) =>
        currentGoals.filter(
          (goal) => goal.id !== id
        )
      )
    } catch (error) {
      console.error(error)

      setGoalError(
        "Could not delete the goal."
      )
    }
  }

  function getCareerForGoal(goal) {
    const cleanTitle =
      goal.title?.trim().toLowerCase()

    return careerLibrary.find(
      (career) =>
        career.name.toLowerCase() === cleanTitle
    )
  }

  function getGoalMilestones(goal) {
    if (
      goal.milestones &&
      goal.milestones.length >= 2
    ) {
      return goal.milestones
    }

    const career = getCareerForGoal(goal)

    if (!career) {
      return goal.milestones || []
    }

    return career.milestones.map(
      (name, index) => ({
        id: `local-${goal.id}-${index}`,
        name,
        completed: false,
      })
    )
  }

  function getGoalProgress(goal) {
    const milestones =
      getGoalMilestones(goal)

    if (!milestones.length) {
      return 0
    }

    const completed =
      milestones.filter(
        (milestone) =>
          milestone.completed
      ).length

    return Math.round(
      (completed / milestones.length) * 100
    )
  }

  const filteredCareers = useMemo(() => {
    const search =
      careerSearch.trim().toLowerCase()

    if (!search) {
      return []
    }

    return careerLibrary.filter(
      (career) =>
        career.name
          .toLowerCase()
          .includes(search) ||
        career.category
          .toLowerCase()
          .includes(search) ||
        career.description
          .toLowerCase()
          .includes(search)
    )
  }, [careerSearch])

  function selectCareer(career) {
    setSelectedCareer(career)
  }

  function useCareerAsGoal() {
    if (!selectedCareer) return

    setTitle(selectedCareer.name)
    setCategory("Career")

    document
      .querySelector(".goal-section")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
  }

  function getRoadmapForGoal(goal) {
    const milestones =
      getGoalMilestones(goal)

    return milestones
  }

  return (
    <div className="career-page">

      {/* HEADER */}

      <header className="career-header">

        <div className="career-header-content">

          <span className="career-eyebrow">
            UNIPILOT • FUTURE PLANNER
          </span>

          <h1>
            Build your career path.
          </h1>

          <p>
            Explore careers, understand the skills
            they require, and create a roadmap you
            can follow step by step.
          </p>

        </div>

        <div className="career-summary">
          <strong>{goals.length}</strong>
          <span>Career Goals</span>
        </div>

      </header>


      {/* CAREER EXPLORER */}

      <section className="career-explorer">

        <div className="explorer-top">

          <div>

            <span className="section-label">
              EXPLORE
            </span>

            <h2>
              Find your career
            </h2>

            <p>
              Search for a career to see what it
              involves, the skills you need, and
              a suggested learning roadmap.
            </p>

          </div>

          <div className="career-search-wrap">

            <span className="search-icon">
              ⌕
            </span>

            <input
              className="career-search"
              type="text"
              placeholder="Search a career..."
              value={careerSearch}
              onChange={(e) =>
                setCareerSearch(e.target.value)
              }
            />

          </div>

        </div>


        {/* SEARCH RESULTS */}

        {careerSearch.trim() && (
          <div className="career-search-results">

            {filteredCareers.length > 0 ? (

              filteredCareers.map(
                (career) => (

                  <button
                    type="button"
                    key={career.name}
                    className={`career-result ${
                      selectedCareer?.name ===
                      career.name
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      selectCareer(career)
                    }
                  >

                    <div>
                      <span>
                        {career.category}
                      </span>

                      <strong>
                        {career.name}
                      </strong>
                    </div>

                    <b>
                      →
                    </b>

                  </button>

                )
              )

            ) : (

              <div className="no-careers">
                No careers found for "
                {careerSearch}".
              </div>

            )}

          </div>
        )}


        {/* CAREER DETAILS */}

        {selectedCareer && (

          <div className="career-profile">

            <div className="career-profile-header">

              <div>

                <span className="career-profile-category">
                  {selectedCareer.category}
                </span>

                <h2>
                  {selectedCareer.name}
                </h2>

                <p>
                  {selectedCareer.description}
                </p>

              </div>

              <button
                type="button"
                className="use-career-button"
                onClick={useCareerAsGoal}
              >
                Use as Goal
                <span>→</span>
              </button>

            </div>


            <div className="career-profile-grid">

              {/* OVERVIEW */}

              <div className="career-profile-card">

                <span className="card-label">
                  CAREER AREAS
                </span>

                <h3>
                  What you'll work with
                </h3>

                <div className="career-parts">

                  {selectedCareer.parts.map(
                    (part, index) => (

                      <div
                        className="career-part"
                        key={part}
                      >

                        <span>
                          {String(
                            index + 1
                          ).padStart(2, "0")}
                        </span>

                        <p>
                          {part}
                        </p>

                      </div>

                    )
                  )}

                </div>

              </div>


              {/* SKILLS */}

              <div className="career-profile-card">

                <span className="card-label">
                  SKILLS
                </span>

                <h3>
                  Skills to develop
                </h3>

                <div className="career-skill-list">

                  {selectedCareer.skills.map(
                    (skill) => (

                      <span key={skill}>
                        {skill}
                      </span>

                    )
                  )}

                </div>

              </div>

            </div>


            {/* ROADMAP */}

            <div className="career-roadmap-card">

              <div className="roadmap-heading">

                <div>

                  <span className="card-label">
                    LEARNING ROADMAP
                  </span>

                  <h3>
                    Your suggested journey
                  </h3>

                </div>

                <span className="roadmap-count">
                  {selectedCareer.milestones.length} steps
                </span>

              </div>


              <div className="career-roadmap">

                {selectedCareer.milestones.map(
                  (milestone, index) => (

                    <div
                      className="roadmap-item"
                      key={milestone}
                    >

                      <div className="roadmap-number">
                        {index + 1}
                      </div>

                      <div className="roadmap-line" />

                      <div className="roadmap-content">

                        <span>
                          STEP {String(
                            index + 1
                          ).padStart(2, "0")}
                        </span>

                        <strong>
                          {milestone}
                        </strong>

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>

          </div>

        )}

      </section>


      {/* CREATE GOAL */}

      <section className="goal-section">

        <div className="goal-section-heading">

          <div>

            <span className="section-label">
              GOAL PLANNER
            </span>

            <h2>
              Turn a career into a goal
            </h2>

            <p>
              Choose a target year and UniPilot
              will help you track your roadmap.
            </p>

          </div>

        </div>


        <form
          className="goal-form"
          onSubmit={addGoal}
        >

          <div className="form-field goal-title-field">

            <label>
              CAREER GOAL
            </label>

            <input
              type="text"
              placeholder="e.g. Full Stack Developer"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
            />

          </div>


          <div className="form-field">

            <label>
              TYPE
            </label>

            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
            >

              <option>
                Career
              </option>

              <option>
                University
              </option>

              <option>
                Personal
              </option>

            </select>

          </div>


          <div className="form-field">

            <label>
              TARGET YEAR
            </label>

            <input
              type="text"
              placeholder="2027"
              value={deadline}
              onChange={(e) =>
                setDeadline(e.target.value)
              }
            />

          </div>


          <button
            className="add-goal-button"
            type="submit"
          >
            Add Goal
            <span>+</span>
          </button>

        </form>


        {goalError && (
          <div className="career-error">
            {goalError}
          </div>
        )}

      </section>


      {/* YOUR GOALS */}

      <section className="goals-section">

        <div className="goals-heading">

          <div>

            <span className="section-label">
              YOUR ROADMAPS
            </span>

            <h2>
              Goals you're working toward
            </h2>

          </div>

          {goals.length > 0 && (
            <span className="goals-count">
              {goals.length} active
            </span>
          )}

        </div>


        {loadingGoals ? (

          <div className="loading-state">
            Loading your goals...
          </div>

        ) : goals.length === 0 ? (

          <div className="empty-goals">

            <div className="empty-icon">
              +
            </div>

            <h3>
              No career goals yet
            </h3>

            <p>
              Search for a career above and add it
              to your personal roadmap.
            </p>

          </div>

        ) : (

          <div className="goals-grid">

            {goals.map((goal) => {

              const milestones =
                getRoadmapForGoal(goal)

              const progress =
                getGoalProgress(goal)

              return (

                <article
                  className="goal-card"
                  key={goal.id}
                >

                  <div className="goal-card-header">

                    <div>

                      <span className="goal-category">
                        {goal.category}
                      </span>

                      <h3>
                        {goal.title}
                      </h3>

                    </div>

                    <div className="goal-target">
                      <span>
                        TARGET
                      </span>

                      <strong>
                        {goal.deadline}
                      </strong>
                    </div>

                  </div>


                  {/* PROGRESS */}

                  <div className="goal-progress-section">

                    <div className="goal-progress-top">

                      <span>
                        Roadmap progress
                      </span>

                      <strong>
                        {progress}%
                      </strong>

                    </div>

                    <div className="goal-progress-bar">

                      <div
                        style={{
                          width: `${progress}%`,
                        }}
                      />

                    </div>

                    <p>
                      {
                        milestones.filter(
                          (item) =>
                            item.completed
                        ).length
                      }{" "}
                      of{" "}
                      {milestones.length} steps
                      completed
                    </p>

                  </div>


                  {/* ROADMAP */}

                  {milestones.length > 0 && (

                    <div className="goal-roadmap">

                      <span className="goal-roadmap-label">
                        ROADMAP
                      </span>

                      {milestones.map(
                        (milestone, index) => (

                          <button
                            type="button"
                            className={`goal-milestone ${
                              milestone.completed
                                ? "completed"
                                : ""
                            }`}
                            key={
                              milestone.id
                            }
                            onClick={() =>
                              toggleMilestone(
                                goal.id,
                                milestone.id
                              )
                            }
                          >

                            <span className="goal-step-number">
                              {String(
                                index + 1
                              ).padStart(2, "0")}
                            </span>

                            <span
                              className={`goal-check ${
                                milestone.completed
                                  ? "checked"
                                  : ""
                              }`}
                            >
                              {milestone.completed
                                ? "✓"
                                : ""}
                            </span>

                            <span className="goal-milestone-name">
                              {milestone.name}
                            </span>

                          </button>

                        )
                      )}

                    </div>

                  )}


                  {/* DELETE */}

                  <div className="goal-card-footer">

                    <button
                      type="button"
                      className="delete-goal"
                      onClick={() =>
                        deleteGoal(goal.id)
                      }
                    >
                      Remove goal
                    </button>

                  </div>

                </article>

              )
            })}

          </div>

        )}

      </section>

    </div>
  )
}

export default CareerGoals