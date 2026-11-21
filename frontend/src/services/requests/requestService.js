import { apiRequest } from '../apiClient.js'

export function listRequests({ signal } = {}) {
  return apiRequest('/pengajuan', { signal })
}

export function createRequest(data) {
  return apiRequest('/pengajuan', { method: 'POST', body: JSON.stringify(data) })
}

export function cancelRequest(id) {
  return apiRequest(`/pengajuan/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function reviewRequest(id, data) {
  return apiRequest(`/pengajuan/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}
