import { apiRequest } from '../apiClient.js'

export function getOperatorDashboard() {
  return apiRequest('/dashboard/operator')
}

export function getTeacherDashboard() {
  return apiRequest('/dashboard/guru')
}

export function getStudentDashboard() {
  return apiRequest('/portal/dashboard')
}
