import { useEffect, useState } from "react"
import "./Notifications.css"

function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

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
  // LOAD NOTIFICATIONS
  // ================================

  useEffect(() => {
    async function loadNotifications() {
      try {
        const response = await fetch(
          "http://localhost:5000/api/notifications",
          {
            headers: getAuthHeaders(),
          }
        )

        if (!response.ok) {
          throw new Error("Could not load notifications.")
        }

        const data = await response.json()

        setNotifications(Array.isArray(data) ? data : [])
        setLoading(false)
      } catch (error) {
        console.error(
          "Notifications loading error:",
          error
        )

        setError(
          "Unable to load notifications. Make sure the backend is running."
        )

        setLoading(false)
      }
    }

    loadNotifications()
  }, [])

  // ================================
  // MARK ONE AS READ
  // ================================

  async function markAsRead(id) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/${id}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
        }
      )

      if (!response.ok) {
        throw new Error(
          "Could not mark notification as read."
        )
      }

      setNotifications((previousNotifications) =>
        previousNotifications.map(
          (notification) =>
            notification.id === id
              ? {
                  ...notification,
                  read: true,
                }
              : notification
        )
      )
    } catch (error) {
      console.error(
        "Mark Notification Error:",
        error
      )

      setError(
        "Could not update notification."
      )
    }
  }

  // ================================
  // MARK ALL AS READ
  // ================================

  async function markAllAsRead() {
    try {
      const response = await fetch(
        "http://localhost:5000/api/notifications/read-all",
        {
          method: "PUT",
          headers: getAuthHeaders(),
        }
      )

      if (!response.ok) {
        throw new Error(
          "Could not mark all notifications as read."
        )
      }

      setNotifications((previousNotifications) =>
        previousNotifications.map(
          (notification) => ({
            ...notification,
            read: true,
          })
        )
      )
    } catch (error) {
      console.error(
        "Mark All Notifications Error:",
        error
      )

      setError(
        "Could not update notifications."
      )
    }
  }

  // ================================
  // DELETE ONE
  // ================================

  async function deleteNotification(id) {
    try {
      const response = await fetch(
        `http://localhost:5000/api/notifications/${id}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      )

      if (!response.ok) {
        throw new Error(
          "Could not delete notification."
        )
      }

      setNotifications((previousNotifications) =>
        previousNotifications.filter(
          (notification) =>
            notification.id !== id
        )
      )
    } catch (error) {
      console.error(
        "Delete Notification Error:",
        error
      )

      setError(
        "Could not delete notification."
      )
    }
  }

  // ================================
  // CLEAR ALL
  // ================================

  async function clearAll() {
    try {
      const response = await fetch(
        "http://localhost:5000/api/notifications",
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      )

      if (!response.ok) {
        throw new Error(
          "Could not clear notifications."
        )
      }

      setNotifications([])
    } catch (error) {
      console.error(
        "Clear Notifications Error:",
        error
      )

      setError(
        "Could not clear notifications."
      )
    }
  }

  // ================================
  // UNREAD COUNT
  // ================================

  const unreadCount =
    notifications.filter(
      (notification) => !notification.read
    ).length

  // ================================
  // ICON
  // ================================

  function getIcon(type) {
    if (type === "assignment") {
      return "📝"
    }

    if (type === "exam") {
      return "🧪"
    }

    if (type === "study") {
      return "📚"
    }

    if (type === "career") {
      return "🎯"
    }

    return "🔔"
  }

  // ================================
  // LOADING
  // ================================

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="empty-notifications">
          <h2>Loading notifications...</h2>

          <p>
            Loading your latest updates.
          </p>
        </div>
      </div>
    )
  }

  // ================================
  // PAGE
  // ================================

  return (
    <div className="notifications-page">

      {/* HEADER */}

      <header className="notifications-header">

        <div>

          <p className="notifications-eyebrow">
            UPDATES & REMINDERS
          </p>

          <h1>
            Notifications
          </h1>

          <p>
            Stay updated with your academic tasks,
            exams, study plans, and career goals.
          </p>

        </div>

        <div className="notification-summary">

          <strong>
            {unreadCount}
          </strong>

          <span>
            Unread
          </span>

        </div>

      </header>


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


      {/* ACTIONS */}

      {notifications.length > 0 && (
        <div className="notification-actions">

          <button
            type="button"
            onClick={markAllAsRead}
          >
            Mark all as read
          </button>

          <button
            type="button"
            onClick={clearAll}
          >
            Clear all
          </button>

        </div>
      )}


      {/* NOTIFICATION LIST */}

      <section className="notification-list">

        {notifications.length === 0 ? (

          <div className="empty-notifications">

            <div className="empty-icon">
              ✓
            </div>

            <h2>
              You're all caught up
            </h2>

            <p>
              There are no notifications to show right now.
            </p>

          </div>

        ) : (

          notifications.map(
            (notification) => (

              <article
                className={`notification-card ${
                  notification.read
                    ? "notification-read"
                    : "notification-unread"
                }`}
                key={notification.id}
                onClick={() =>
                  markAsRead(notification.id)
                }
              >

                {/* ICON */}

                <div className="notification-icon">
                  {getIcon(notification.type)}
                </div>


                {/* CONTENT */}

                <div className="notification-content">

                  <div className="notification-top">

                    <h2>
                      {notification.title}
                    </h2>

                    {!notification.read && (
                      <span className="unread-dot"></span>
                    )}

                  </div>

                  <p>
                    {notification.message}
                  </p>

                  <span className="notification-time">
                    {notification.time}
                  </span>

                </div>


                {/* DELETE */}

                <button
                  type="button"
                  className="notification-delete"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteNotification(
                      notification.id
                    )
                  }}
                >
                  ×
                </button>

              </article>

            )
          )

        )}

      </section>

    </div>
  )
}

export default Notifications