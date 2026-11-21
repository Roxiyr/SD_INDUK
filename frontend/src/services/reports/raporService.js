import { apiRequest } from '../apiClient.js'

export function listReports(nisn, { signal } = {}) {
  return apiRequest(`/rapor/siswa/${encodeURIComponent(nisn)}`, { signal })
}

export function listClassReports(idKelas, semester, { signal } = {}) {
  const params = new URLSearchParams({ semester })
  return apiRequest(`/rapor/kelas/${encodeURIComponent(idKelas)}?${params}`, { signal })
}

export function listPendingVerifications({ signal } = {}) {
  return apiRequest('/rapor/verifikasi', { signal })
}

export function listApprovedReports({ signal } = {}) {
  return apiRequest('/rapor/disetujui', { signal })
}

export function getReport(idRapor) {
  return apiRequest(`/rapor/${encodeURIComponent(idRapor)}`)
}

export function createReport(data) {
  return apiRequest('/rapor', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateReport(idRapor, data) {
  return apiRequest(`/rapor/${encodeURIComponent(idRapor)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function saveSubjects(idRapor, data) {
  return apiRequest(`/rapor/${encodeURIComponent(idRapor)}/mapel`, {
    method: 'POST',
    body: JSON.stringify({ data }),
  })
}

export function saveP5(idRapor, data) {
  return apiRequest(`/rapor/${encodeURIComponent(idRapor)}/p5`, {
    method: 'POST',
    body: JSON.stringify({ data }),
  })
}

export function deleteReportItem(idRapor, type, idItem) {
  return apiRequest(`/rapor/${encodeURIComponent(idRapor)}/${encodeURIComponent(type)}/${encodeURIComponent(idItem)}`, {
    method: 'DELETE',
  })
}

export function submitReportForVerification(idRapor, catatan = '') {
  return apiRequest(`/rapor/${encodeURIComponent(idRapor)}/ajukan`, {
    method: 'POST',
    body: JSON.stringify({ catatan }),
  })
}

export function reviewReportVerification(idRapor, data) {
  return apiRequest(`/rapor/${encodeURIComponent(idRapor)}/verifikasi`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export function reopenApprovedReport(idRapor, catatan) {
  return apiRequest(`/rapor/${encodeURIComponent(idRapor)}/buka-revisi`, {
    method: 'POST',
    body: JSON.stringify({ catatan }),
  })
}
