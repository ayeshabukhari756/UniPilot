import { useEffect, useMemo, useState } from "react"
import "./SkillRoadmap.css"

const API_URL = "https://unipilot-production.up.railway.app"

function SkillRoadmap() {
  const careerData = {
    "Full Stack Developer": {
      description:
        "Build complete web applications by working across frontend, backend, databases, and deployment.",
      scope:
        "Useful for web development, software engineering, freelance work, startups, and technology companies.",
      skills: [
        { id: 1, name: "HTML & CSS", category: "Technical", progress: 0, status: "Next" },
        { id: 2, name: "JavaScript", category: "Programming", progress: 0, status: "Next" },
        { id: 3, name: "React", category: "Frontend", progress: 0, status: "Next" },
        { id: 4, name: "Node.js", category: "Backend", progress: 0, status: "Next" },
        { id: 5, name: "REST APIs", category: "Backend", progress: 0, status: "Next" },
        { id: 6, name: "Databases", category: "Data", progress: 0, status: "Next" },
        { id: 7, name: "Authentication", category: "Security", progress: 0, status: "Next" },
        { id: 8, name: "Deployment", category: "DevOps", progress: 0, status: "Next" },
      ],
    },

    "Frontend Developer": {
      description:
        "Create responsive, interactive, accessible, and user-friendly digital interfaces.",
      scope:
        "Useful for web development, UI engineering, product teams, agencies, and freelance work.",
      skills: [
        { id: 1, name: "HTML & CSS", category: "Technical", progress: 0, status: "Next" },
        { id: 2, name: "JavaScript", category: "Programming", progress: 0, status: "Next" },
        { id: 3, name: "React", category: "Framework", progress: 0, status: "Next" },
        { id: 4, name: "Responsive Design", category: "Design", progress: 0, status: "Next" },
        { id: 5, name: "Accessibility", category: "UI", progress: 0, status: "Next" },
        { id: 6, name: "Testing", category: "Engineering", progress: 0, status: "Next" },
      ],
    },

    "Backend Developer": {
      description:
        "Build server-side applications, APIs, authentication systems, and data-driven services.",
      scope:
        "Useful for software engineering, cloud applications, API development, and full-stack careers.",
      skills: [
        { id: 1, name: "Programming Fundamentals", category: "Programming", progress: 0, status: "Next" },
        { id: 2, name: "Node.js", category: "Backend", progress: 0, status: "Next" },
        { id: 3, name: "REST APIs", category: "Backend", progress: 0, status: "Next" },
        { id: 4, name: "Databases", category: "Data", progress: 0, status: "Next" },
        { id: 5, name: "Authentication", category: "Security", progress: 0, status: "Next" },
        { id: 6, name: "Deployment", category: "DevOps", progress: 0, status: "Next" },
      ],
    },

    "Data Analyst": {
      description:
        "Turn data into useful insights that help organizations make better decisions.",
      scope:
        "Useful in business, finance, healthcare, education, marketing, research, and technology.",
      skills: [
        { id: 1, name: "Excel", category: "Data", progress: 0, status: "Next" },
        { id: 2, name: "Statistics", category: "Analytics", progress: 0, status: "Next" },
        { id: 3, name: "SQL", category: "Data", progress: 0, status: "Next" },
        { id: 4, name: "Data Visualization", category: "Analytics", progress: 0, status: "Next" },
        { id: 5, name: "Python for Data", category: "Programming", progress: 0, status: "Next" },
        { id: 6, name: "Communication", category: "Professional", progress: 0, status: "Next" },
      ],
    },

    "Business & Management": {
      description:
        "Develop the knowledge and practical skills needed to manage organizations, projects, and teams.",
      scope:
        "Useful for business, management, entrepreneurship, marketing, HR, finance, and administration.",
      skills: [
        { id: 1, name: "Business Fundamentals", category: "Business", progress: 0, status: "Next" },
        { id: 2, name: "Communication", category: "Professional", progress: 0, status: "Next" },
        { id: 3, name: "Leadership", category: "Management", progress: 0, status: "Next" },
        { id: 4, name: "Financial Literacy", category: "Finance", progress: 0, status: "Next" },
        { id: 5, name: "Project Management", category: "Management", progress: 0, status: "Next" },
        { id: 6, name: "Problem Solving", category: "Professional", progress: 0, status: "Next" },
      ],
    },

    "Marketing": {
      description:
        "Learn how to understand audiences, create campaigns, communicate value, and grow brands.",
      scope:
        "Useful for digital marketing, advertising, social media, branding, sales, and entrepreneurship.",
      skills: [
        { id: 1, name: "Marketing Fundamentals", category: "Marketing", progress: 0, status: "Next" },
        { id: 2, name: "Content Creation", category: "Creative", progress: 0, status: "Next" },
        { id: 3, name: "Social Media", category: "Digital", progress: 0, status: "Next" },
        { id: 4, name: "Market Research", category: "Research", progress: 0, status: "Next" },
        { id: 5, name: "Communication", category: "Professional", progress: 0, status: "Next" },
        { id: 6, name: "Analytics", category: "Data", progress: 0, status: "Next" },
      ],
    },

    "Graphic Designer": {
      description:
        "Develop visual communication skills for digital products, branding, publications, and creative work.",
      scope:
        "Useful for graphic design, branding, advertising, UI design, social media, and freelance work.",
      skills: [
        { id: 1, name: "Design Fundamentals", category: "Design", progress: 0, status: "Next" },
        { id: 2, name: "Typography", category: "Design", progress: 0, status: "Next" },
        { id: 3, name: "Color Theory", category: "Design", progress: 0, status: "Next" },
        { id: 4, name: "Branding", category: "Creative", progress: 0, status: "Next" },
        { id: 5, name: "Portfolio Development", category: "Career", progress: 0, status: "Next" },
        { id: 6, name: "Client Communication", category: "Professional", progress: 0, status: "Next" },
      ],
    },

    "UI/UX Designer": {
      description:
        "Design digital experiences that are useful, accessible, intuitive, and enjoyable to use.",
      scope:
        "Useful for product design, mobile apps, websites, software companies, agencies, and startups.",
      skills: [
        { id: 1, name: "Design Fundamentals", category: "Design", progress: 0, status: "Next" },
        { id: 2, name: "User Research", category: "Research", progress: 0, status: "Next" },
        { id: 3, name: "Wireframing", category: "UX", progress: 0, status: "Next" },
        { id: 4, name: "Prototyping", category: "UX", progress: 0, status: "Next" },
        { id: 5, name: "Usability Testing", category: "Research", progress: 0, status: "Next" },
        { id: 6, name: "Portfolio Development", category: "Career", progress: 0, status: "Next" },
      ],
    },

    "Teacher / Educator": {
      description:
        "Develop the knowledge and communication skills needed to teach, guide, and support learners.",
      scope:
        "Useful for schools, colleges, universities, training organizations, tutoring, and educational technology.",
      skills: [
        { id: 1, name: "Subject Knowledge", category: "Education", progress: 0, status: "Next" },
        { id: 2, name: "Communication", category: "Professional", progress: 0, status: "Next" },
        { id: 3, name: "Lesson Planning", category: "Teaching", progress: 0, status: "Next" },
        { id: 4, name: "Presentation Skills", category: "Professional", progress: 0, status: "Next" },
        { id: 5, name: "Student Assessment", category: "Teaching", progress: 0, status: "Next" },
        { id: 6, name: "Digital Learning Tools", category: "Technology", progress: 0, status: "Next" },
      ],
    },

    "Researcher": {
      description:
        "Build the ability to investigate questions, analyze evidence, and communicate meaningful findings.",
      scope:
        "Useful across science, social sciences, business, healthcare, education, technology, and academia.",
      skills: [
        { id: 1, name: "Research Methods", category: "Research", progress: 0, status: "Next" },
        { id: 2, name: "Critical Thinking", category: "Thinking", progress: 0, status: "Next" },
        { id: 3, name: "Data Analysis", category: "Analytics", progress: 0, status: "Next" },
        { id: 4, name: "Academic Writing", category: "Writing", progress: 0, status: "Next" },
        { id: 5, name: "Literature Review", category: "Research", progress: 0, status: "Next" },
        { id: 6, name: "Presentation Skills", category: "Professional", progress: 0, status: "Next" },
      ],
    },

    "Healthcare Professional": {
      description:
        "Build professional, communication, analytical, and patient-focused skills for healthcare careers.",
      scope:
        "Useful for healthcare, clinical environments, public health, research, and healthcare management.",
      skills: [
        { id: 1, name: "Professional Knowledge", category: "Healthcare", progress: 0, status: "Next" },
        { id: 2, name: "Patient Communication", category: "Communication", progress: 0, status: "Next" },
        { id: 3, name: "Ethics", category: "Professional", progress: 0, status: "Next" },
        { id: 4, name: "Critical Thinking", category: "Thinking", progress: 0, status: "Next" },
        { id: 5, name: "Research Skills", category: "Research", progress: 0, status: "Next" },
        { id: 6, name: "Teamwork", category: "Professional", progress: 0, status: "Next" },
      ],
    },

    "Engineer": {
      description:
        "Develop technical knowledge, problem-solving ability, project skills, and professional competence.",
      scope:
        "Useful across civil, electrical, mechanical, industrial, chemical, environmental, and other engineering fields.",
      skills: [
        { id: 1, name: "Engineering Fundamentals", category: "Technical", progress: 0, status: "Next" },
        { id: 2, name: "Problem Solving", category: "Thinking", progress: 0, status: "Next" },
        { id: 3, name: "Technical Communication", category: "Professional", progress: 0, status: "Next" },
        { id: 4, name: "Project Management", category: "Management", progress: 0, status: "Next" },
        { id: 5, name: "Computer-Aided Tools", category: "Technology", progress: 0, status: "Next" },
        { id: 6, name: "Professional Ethics", category: "Professional", progress: 0, status: "Next" },
      ],
    },

    "Law & Legal Studies": {
      description:
        "Develop research, reasoning, communication, and professional skills relevant to legal careers.",
      scope:
        "Useful for legal practice, corporate work, public service, research, compliance, and policy.",
      skills: [
        { id: 1, name: "Legal Research", category: "Law", progress: 0, status: "Next" },
        { id: 2, name: "Legal Writing", category: "Writing", progress: 0, status: "Next" },
        { id: 3, name: "Critical Thinking", category: "Thinking", progress: 0, status: "Next" },
        { id: 4, name: "Public Speaking", category: "Communication", progress: 0, status: "Next" },
        { id: 5, name: "Negotiation", category: "Professional", progress: 0, status: "Next" },
        { id: 6, name: "Professional Ethics", category: "Professional", progress: 0, status: "Next" },
      ],
    },

    "Writer / Content Creator": {
      description:
        "Build strong writing, communication, research, storytelling, and digital content skills.",
      scope:
        "Useful for publishing, journalism, social media, marketing, education, freelancing, and media.",
      skills: [
        { id: 1, name: "Writing Fundamentals", category: "Writing", progress: 0, status: "Next" },
        { id: 2, name: "Storytelling", category: "Creative", progress: 0, status: "Next" },
        { id: 3, name: "Research", category: "Research", progress: 0, status: "Next" },
        { id: 4, name: "Editing", category: "Writing", progress: 0, status: "Next" },
        { id: 5, name: "Digital Content", category: "Digital", progress: 0, status: "Next" },
        { id: 6, name: "Communication", category: "Professional", progress: 0, status: "Next" },
      ],
    },
  }

  const [career, setCareer] = useState("Full Stack Developer")

  const [skills, setSkills] = useState(
    careerData["Full Stack Developer"].skills
  )

  const currentCareer = careerData[career]

  function getAuthHeaders() {
    const token = localStorage.getItem("token")

    return {
      "Content-Type": "application/json",
      ...(token
        ? { Authorization: `Bearer ${token}` }
        : {}),
    }
  }

  function getDefaultSkills(careerName) {
    return (careerData[careerName]?.skills || []).map(
      (skill) => ({
        ...skill,
      })
    )
  }

  useEffect(() => {
    async function loadSkillsForCareer() {
      try {
        const response = await fetch(
          `${API_URL}/api/skill-roadmap?career=${encodeURIComponent(career)}`,
          {
            headers: getAuthHeaders(),
          }
        )

        const data = await response.json().catch(() => ({}))

        if (!response.ok) {
          setSkills(getDefaultSkills(career))
          return
        }

        if (Array.isArray(data.skills) && data.skills.length > 0) {
          setSkills(data.skills)
        } else {
          setSkills(getDefaultSkills(career))
        }
      } catch (error) {
        console.error("Load Skill Roadmap Error:", error)
        setSkills(getDefaultSkills(career))
      }
    }

    loadSkillsForCareer()
  }, [career])

  function changeCareer(value) {
    setCareer(value)
    setSkills(getDefaultSkills(value))
  }

  async function createNotification(skill, newProgress) {
    try {
      await fetch(`${API_URL}/api/notifications`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          type: "career",
          title: `${skill.name} progress updated`,
          message: `You reached ${newProgress}% progress in ${skill.name}. Keep going!`,
          time: "Just now",
        }),
      })
    } catch (error) {
      console.error(
        "Could not create skill notification:",
        error
      )
    }
  }

  async function updateProgress(id) {
    const skill = skills.find((item) => item.id === id)

    if (!skill) return

    const newProgress = Math.min(skill.progress + 10, 100)

    let newStatus = "Next"

    if (newProgress === 100) {
      newStatus = "Completed"
    } else if (newProgress > 0) {
      newStatus = "In Progress"
    }

    const updatedSkills = skills.map((item) =>
      item.id === id
        ? {
            ...item,
            progress: newProgress,
            status: newStatus,
          }
        : item
    )

    try {
      const encodedCareer = encodeURIComponent(career)

      let response = await fetch(
        `${API_URL}/api/skill-roadmap/${encodedCareer}/${id}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            progress: newProgress,
            status: newStatus,
          }),
        }
      )

      if (response.status === 404) {
        response = await fetch(
          `${API_URL}/api/skill-roadmap`,
          {
            method: "POST",
            headers: getAuthHeaders(),
            body: JSON.stringify({
              career,
              skills: updatedSkills,
            }),
          }
        )
      }

      if (!response.ok) {
        console.error("Could not save skill progress.")
        return
      }

      setSkills(updatedSkills)
      createNotification(skill, newProgress)
    } catch (error) {
      console.error("Update Skill Roadmap Error:", error)
    }
  }

  const completed = skills.filter(
    (skill) => skill.progress === 100
  ).length

  const inProgress = skills.filter(
    (skill) =>
      skill.progress > 0 &&
      skill.progress < 100
  ).length

  const overallProgress = useMemo(() => {
    if (skills.length === 0) {
      return 0
    }

    return Math.round(
      skills.reduce(
        (total, skill) => total + skill.progress,
        0
      ) / skills.length
    )
  }, [skills])

  const nextSkill = skills.find(
    (skill) => skill.progress < 100
  )

  return (
    <div className="roadmap-page">

      {/* HEADER */}

      <header className="roadmap-header">

        <div className="roadmap-heading">

          <p className="roadmap-eyebrow">
            CAREER DEVELOPMENT
          </p>

          <h1>
            Skill Roadmap
          </h1>

          <p>
            Build the skills your target career needs and
            track your progress as you grow.
          </p>

        </div>

        <div className="career-selector">

          <label htmlFor="career">
            TARGET CAREER
          </label>

          <select
            id="career"
            value={career}
            onChange={(e) =>
              changeCareer(e.target.value)
            }
          >

            {Object.keys(careerData).map(
              (careerName) => (
                <option
                  key={careerName}
                  value={careerName}
                >
                  {careerName}
                </option>
              )
            )}

          </select>

        </div>

      </header>


      {/* CAREER OVERVIEW */}

      <section className="career-overview">

        <div className="career-main">

          <p className="card-label">
            CAREER PATH
          </p>

          <h2>
            {career}
          </h2>

          <p>
            {currentCareer.description}
          </p>

          <div className="scope-box">

            <span>
              CAREER SCOPE
            </span>

            <p>
              {currentCareer.scope}
            </p>

          </div>

        </div>


        <div className="progress-summary">

          <div className="progress-number">
            {overallProgress}%
          </div>

          <span>
            Overall progress
          </span>

          <div className="summary-line">

            <div
              style={{
                width: `${overallProgress}%`,
              }}
            ></div>

          </div>

          <div className="summary-stats">

            <div>
              <strong>
                {completed}
              </strong>

              <span>
                Completed
              </span>
            </div>

            <div>
              <strong>
                {inProgress}
              </strong>

              <span>
                In progress
              </span>
            </div>

            <div>
              <strong>
                {skills.length -
                  completed -
                  inProgress}
              </strong>

              <span>
                Next
              </span>
            </div>

          </div>

        </div>

      </section>


      {/* NEXT SKILL */}

      {nextSkill && (

        <section className="next-skill">

          <div>

            <p className="card-label">
              NEXT RECOMMENDED SKILL
            </p>

            <h2>
              {nextSkill.name}
            </h2>

            <p>
              {nextSkill.category} · Continue building
              this skill to move forward in your roadmap.
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              updateProgress(nextSkill.id)
            }
          >
            Update Progress
          </button>

        </section>

      )}


      {/* ROADMAP */}

      <section className="roadmap-section">

        <div className="section-title">

          <div>

            <p className="card-label">
              YOUR PATH
            </p>

            <h2>
              Recommended skill sequence
            </h2>

          </div>

          <span>
            {skills.length} skills
          </span>

        </div>


        <div className="skills-grid">

          {skills.map((skill, index) => (

            <article
              className="skill-item"
              key={skill.id}
            >

              <div className="skill-index">
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className="skill-content">

                <div className="skill-top">

                  <div>

                    <span className="skill-category">
                      {skill.category}
                    </span>

                    <h3>
                      {skill.name}
                    </h3>

                  </div>

                  <span
                    className={`skill-status ${
                      skill.status
                        .toLowerCase()
                        .replace(" ", "-")
                    }`}
                  >
                    {skill.status}
                  </span>

                </div>


                <div className="skill-progress">

                  <div className="skill-progress-info">

                    <span>
                      Progress
                    </span>

                    <strong>
                      {skill.progress}%
                    </strong>

                  </div>

                  <div className="skill-bar">

                    <div
                      className="skill-fill"
                      style={{
                        width: `${skill.progress}%`,
                      }}
                    ></div>

                  </div>

                </div>


                {skill.progress < 100 && (

                  <button
                    type="button"
                    className="skill-update"
                    onClick={() =>
                      updateProgress(skill.id)
                    }
                  >
                    + 10% progress
                  </button>

                )}

              </div>

            </article>

          ))}

        </div>

      </section>

    </div>
  )
}

export default SkillRoadmap