import { apiRequest } from '../apiClient.js'

export function listActiveClasses({ signal } = {}) {
  return apiRequest('/kelas/aktif', { signal })
}

export function listStudents({ search = '', status = '', limit = 100, offset = 0, signal } = {}) {
  const params = new URLSearchParams({ limit: String(limit), offset: String(offset) })
  if (search) params.set('search', search)
  if (status) params.set('status', status)
  return apiRequest(`/siswa?${params}`, { signal })
}

export function getStudent(nisn) {
  return apiRequest(`/siswa/${encodeURIComponent(nisn)}`)
}

export function createStudent(data) {
  return apiRequest('/siswa', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateStudent(nisn, data) {
  return apiRequest(`/siswa/${encodeURIComponent(nisn)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteStudent(nisn) {
  return apiRequest(`/siswa/${encodeURIComponent(nisn)}`, {
    method: 'DELETE',
  })
}
