const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

export async function apiRequest(path, options = {}) {
  const token = sessionStorage.getItem('sd-induk.token')
  const headers = new Headers(options.headers || {})

  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (response.status === 204) return null

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('application/json')) {
    if (!response.ok) throw new Error('Permintaan ke server gagal.')
    return response
  }

  const body = await response.json()
  if (!response.ok) {
    const error = new Error(body.message || 'Permintaan ke server gagal.')
    error.errors = body.errors
    error.status = response.status
    throw error
  }

  return body.data
}
