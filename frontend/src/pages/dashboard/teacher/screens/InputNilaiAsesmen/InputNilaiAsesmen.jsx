import TeacherGradebook from '../../components/TeacherGradebook.jsx'

function InputNilaiAsesmen(props) {
  return <TeacherGradebook
    students={props.students}
    initialNisn={props.initialNisn}
    classes={props.dashboardData?.classes}
    academicYear={props.dashboardData?.academicYear}
  />
}

export default InputNilaiAsesmen
