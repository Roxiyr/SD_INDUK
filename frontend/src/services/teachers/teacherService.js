import { apiRequest } from '../apiClient.js'

export function listTeachers({ signal } = {}) {
  return apiRequest('/guru', { signal })
}

export function getTeacherFormOptions({ signal } = {}) {
  return apiRequest('/guru/form-options', { signal })
}

export function createTeacher(data) {
  return apiRequest('/guru', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateTeacher(id, data) {
  return apiRequest(`/guru/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function deleteTeacher(id) {
  return apiRequest(`/guru/${encodeURIComponent(id)}`, { method: 'DELETE' })
}

export function linkTeacherAccount(idUser, data) {
  return apiRequest(`/guru/akun/${encodeURIComponent(idUser)}/profil`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}
