import { apiRequest } from '../apiClient.js'

export function getScheduleOptions({ signal } = {}) {
  return apiRequest('/jadwal/options', { signal })
}

export function listSchedules(idKelas, { signal } = {}) {
  const params = new URLSearchParams()
  if (idKelas) params.set('id_kelas', String(idKelas))
  const query = params.toString()
  return apiRequest(`/jadwal${query ? `?${query}` : ''}`, { signal })
}

export function createSchedule(data) {
  return apiRequest('/jadwal', { method: 'POST', body: JSON.stringify(data) })
}

export function updateSchedule(id, data) {
  return apiRequest(`/jadwal/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(data) })
}

export function deleteSchedule(id) {
  return apiRequest(`/jadwal/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
