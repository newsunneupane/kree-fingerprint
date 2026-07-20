const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}/api${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || 'Request failed')
  }
  return res.json()
}
