import { apiRequest } from '../apiClient.js'

export function listApprovedStudentReports({ signal } = {}) {
  return apiRequest('/portal/rapor', { signal })
}
