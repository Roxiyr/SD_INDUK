import LoginPage from './pages/loginpage/LoginPage.jsx'
import DashboardPage from './pages/dashboard/DashboardPage.jsx'
import TeacherDashboardPage from './pages/dashboard/teacher/TeacherDashboardPage.jsx'
import StudentDashboardPage from './pages/dashboard/student/StudentDashboardPage.jsx'
import useSessionState from './hooks/useSessionState.js'

const roles = ['operator', 'teacher', 'student']
const sessionKeys = ['sd-induk.activeRole', 'sd-induk.operatorPage', 'sd-induk.operatorRole', 'sd-induk.teacherPage', 'sd-induk.studentPage']

function App() {
  const [activeRole, setActiveRole] = useSessionState('sd-induk.activeRole', null, roles)

  function handleLogout() {
    sessionKeys.forEach((key) => sessionStorage.removeItem(key))
    setActiveRole(null)
  }

  if (activeRole === 'teacher') {
    return <TeacherDashboardPage onLogout={handleLogout} />
  }

  if (activeRole === 'student') {
    return <StudentDashboardPage onLogout={handleLogout} />
  }

  if (activeRole === 'operator') {
    return <DashboardPage onLogout={handleLogout} />
  }

  return <LoginPage onLogin={setActiveRole} />
}

export default App
