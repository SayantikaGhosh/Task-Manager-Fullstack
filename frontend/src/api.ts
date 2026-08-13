let refreshPromise: Promise<string | null> | null = null

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem("refresh_token")

  if (!refreshToken) {
    return null
  }

  const response = await fetch(
    "http://127.0.0.1:8000/auth/refresh",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh_token: refreshToken,
      }),
    }
  )

  if (!response.ok) {
    return null
  }

  const data = await response.json()

  localStorage.setItem(
    "access_token",
    data.access_token
  )

  return data.access_token
}

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  let token = localStorage.getItem("access_token")

  const headers = new Headers(options.headers)

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    )
  }

  let response = await fetch(url, {
    ...options,
    headers,
  })

  if (response.status !== 401) {
    return response
  }

  if (!refreshPromise) {
    refreshPromise = refreshAccessToken()
  }

  token = await refreshPromise

  refreshPromise = null

  if (!token) {
    return response
  }

  headers.set(
    "Authorization",
    `Bearer ${token}`
  )

  response = await fetch(url, {
    ...options,
    headers,
  })

  return response
}