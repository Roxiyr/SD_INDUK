import { useMemo, useState } from 'react'
import './DaftarSiswaBinaan.css'

function DaftarSiswaBinaan({ students = [], search = '', onOpenGradebook, onOpenCorrection }) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const term = `${query} ${search}`.trim().toLowerCase()
    return students.filter((student) =>
      `${student.nama_lengkap} ${student.nisn} ${student.nama_kelas}`.toLowerCase().includes(term),
    )
  }, [students, query, search])
  const attendanceDays = students.reduce((total, student) => total + Number(student.total_hari || 0), 0)
  const presentDays = students.reduce((total, student) => total + Number(student.hadir || 0), 0)
  const attendanceRate = attendanceDays ? Math.round((presentDays / attendanceDays) * 1000) / 10 : null
  const scoredStudents = students.filter((student) => student.nilai_rata_rata !== null && student.nilai_rata_rata !== undefined)
  const scoreAverage = scoredStudents.length
    ? scoredStudents.reduce((total, student) => total + Number(student.nilai_rata_rata), 0) / scoredStudents.length
    : null
  const p5Students = students.filter((student) => Number(student.catatan_p5) > 0).length

  return (
    <section className="teacher-module-screen teacher-student-list-live">
      <header className="teacher-module-heading">
        <div><span className="teacher-module-eyebrow">DATA DARI DATABASE</span><h1>Daftar Siswa Binaan</h1><p>Siswa aktif dari kelas yang ditugaskan kepada Anda pada tahun ajaran berjalan.</p></div>
      </header>
      <div className="teacher-module-metrics">
        <Metric title="Siswa binaan" value={students.length} detail="Penugasan aktif" />
        <Metric title="Kehadiran" value={attendanceRate === null ? '—' : `${attendanceRate}%`} detail={`${presentDays} dari ${attendanceDays} hari tercatat`} />
        <Metric title="Rata-rata nilai" value={scoreAverage === null ? '—' : scoreAverage.toLocaleString('id-ID', { maximumFractionDigits: 1 })} detail={`${scoredStudents.length} siswa memiliki nilai`} />
        <Metric title="Catatan P5" value={`${p5Students}/${students.length}`} detail="Siswa dengan catatan tersimpan" />
      </div>
      <section className="teacher-module-table-card">
        <div className="teacher-table-toolbar">
          <label className="teacher-table-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama atau NISN..." aria-label="Cari siswa binaan" /></label>
          <span className="teacher-table-count">{filtered.length} siswa</span>
        </div>
        <div className="teacher-module-table-wrap">
          <table className="teacher-module-table">
            <thead><tr><th>Siswa</th><th>Kelas</th><th>Kehadiran</th><th>Rata-rata nilai</th><th>Catatan P5</th><th>Aksi</th></tr></thead>
            <tbody>
              {filtered.map((student) => (
                <tr key={student.nisn}>
                  <td><div className="teacher-row-identity"><span className="teacher-row-initial">{student.nama_lengkap?.charAt(0) || 'S'}</span><div><strong>{student.nama_lengkap}</strong><small>{student.nisn}</small></div></div></td>
                  <td>{student.nama_kelas || '—'}</td>
                  <td>{student.total_hari ? `${Math.round((student.hadir / student.total_hari) * 1000) / 10}% (${student.hadir}/${student.total_hari})` : 'Belum ada data'}</td>
                  <td>{student.nilai_rata_rata == null ? 'Belum ada nilai' : Number(student.nilai_rata_rata).toLocaleString('id-ID', { maximumFractionDigits: 1 })}</td>
                  <td>{student.catatan_p5 || 0} catatan</td>
                  <td><div className="teacher-student-actions">
                    <button type="button" onClick={() => onOpenGradebook?.(student.nisn)}>Input nilai</button>
                    <button type="button" onClick={() => onOpenCorrection?.(student.nisn)}>Koreksi data</button>
                  </div></td>
                </tr>
              ))}
              {!filtered.length && <tr><td className="teacher-table-empty" colSpan="6">{students.length ? 'Tidak ada siswa yang cocok dengan pencarian.' : 'Belum ada siswa yang ditugaskan.'}</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  )
}

function Metric({ title, value, detail }) {
  return <article className="teacher-module-metric"><div><h2>{title}</h2><strong>{value}</strong><p>{detail}</p></div></article>
}

export default DaftarSiswaBinaan
