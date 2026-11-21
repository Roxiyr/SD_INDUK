import TeacherP5Editor from '../../components/TeacherP5Editor.jsx'

function CatatanKarakterP5(props) {
  return <TeacherP5Editor
    students={props.students}
    classes={props.dashboardData?.classes}
    academicYear={props.dashboardData?.academicYear}
  />
}

export default CatatanKarakterP5
