import { apiRequest } from '../apiClient.js'

export function listUsers({ signal } = {}) {
  return apiRequest('/users', { signal })
}

export function createUser(data) {
  return apiRequest('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateUser(id, data) {
  return apiRequest(`/users/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteUser(id) {
  return apiRequest(`/users/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
