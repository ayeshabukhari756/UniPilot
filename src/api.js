export const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000"

export function getToken() {
  return localStorage.getItem("token")
}

export function clearAuth() {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
}

export function getAuthHeaders({ json = true } = {}) {
  const token = getToken()
  const headers = {}

  if (json) {
    headers["Content-Type"] = "application/json"
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return headers
}

export function handleUnauthorized() {
  clearAuth()

  if (!window.location.pathname.startsWith("/login")) {
    window.location.assign("/login")
  }
}

export async function apiFetch(path, options = {}) {
  const {
    auth = true,
    json = true,
    skipUnauthorizedRedirect = false,
    headers: extraHeaders = {},
    ...rest
  } = options

  const headers = {
    ...(auth
      ? getAuthHeaders({ json })
      : json
        ? { "Content-Type": "application/json" }
        : {}),
    ...extraHeaders,
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers,
  })

  if (
    response.status === 401 &&
    auth &&
    !skipUnauthorizedRedirect
  ) {
    handleUnauthorized()
  }

  return response
}
