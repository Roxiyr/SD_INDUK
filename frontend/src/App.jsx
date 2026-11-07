import { useState } from 'react'
import LoginPage from './pages/LoginPage.jsx'
import DashboardPage from './pages/dashboard/DashboardPage.jsx'

function App() {
  const [activeRole, setActiveRole] = useState(null)

  if (activeRole === 'operator') {
    return <DashboardPage onLogout={() => setActiveRole(null)} />
  }

  return <LoginPage onLogin={setActiveRole} />
}

export default App
