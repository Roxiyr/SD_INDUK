import { apiRequest } from '../apiClient.js'

export function listClasses({ signal } = {}) {
  return apiRequest('/kelas', { signal })
}

export function createClass(data) {
  return apiRequest('/kelas', { method: 'POST', body: JSON.stringify(data) })
}

export function updateClass(id, data) {
  return apiRequest(`/kelas/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteClass(id) {
  return apiRequest(`/kelas/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
