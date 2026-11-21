import { apiRequest } from '../apiClient.js'

export function getClassAttendance(idKelas, tanggal, { signal } = {}) {
  const params = new URLSearchParams({ tanggal })
  if (idKelas) params.set('id_kelas', String(idKelas))
  return apiRequest(`/presensi?${params}`, { signal })
}

export function saveClassAttendance(data) {
  return apiRequest('/presensi/batch', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
