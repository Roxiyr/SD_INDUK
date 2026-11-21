import { apiRequest } from '../apiClient.js'

export function listActiveClasses({ signal } = {}) {
  return apiRequest('/kelas/aktif', { signal })
}
