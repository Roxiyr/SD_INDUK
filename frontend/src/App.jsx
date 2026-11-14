import { useState } from 'react'
import LoginPage from './pages/loginpage/LoginPage.jsx'
import DashboardPage from './pages/dashboard/DashboardPage.jsx'
import TeacherDashboardPage from './pages/dashboard/teacher/TeacherDashboardPage.jsx'
import StudentDashboardPage from './pages/dashboard/student/StudentDashboardPage.jsx'

function App() {
  const [activeRole, setActiveRole] = useState(null)

  if (activeRole === 'teacher') {
    return <TeacherDashboardPage onLogout={() => setActiveRole(null)} />
  }

  if (activeRole === 'student') {
    return <StudentDashboardPage onLogout={() => setActiveRole(null)} />
  }

  if (activeRole === 'operator') {
    return <DashboardPage onLogout={() => setActiveRole(null)} />
  }

  return <LoginPage onLogin={setActiveRole} />
}

export default App
