import { useState } from 'react'
import './StudentDataPage.css'

function StudentIcon({ name, size = 17 }) {
  const paths = {
    activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
    archive: <><rect x="3" y="4" width="18" height="5" rx="1" /><path d="M5 9v11h14V9m-9 4h4" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></>,
    clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4.5h6a1.5 1.5 0 0 0-3-1 1.5 1.5 0 0 0-3 1ZM9 11h6m-6 4h6" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5m-5 5V3" /></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
    user: <><path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="8" r="5" /></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" /><circle cx="12" cy="12" r="2.5" /></>,
  }

  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name] || paths.file}</svg>
}

function renderCell(value) {
  if (value && typeof value === 'object' && 'status' in value) {
    return <span className="student-page-status">{value.status}</span>
  }

  if (value && typeof value === 'object' && 'label' in value) {
    return <span className="student-page-identity"><i>{value.initial || value.label.charAt(0)}</i><strong>{value.label}</strong></span>
  }

  return value
}

function StudentDataPage({ data, search = '', onNotice }) {
  const [localSearch, setLocalSearch] = useState('')
  const searchTerm = `${search} ${localSearch}`.trim().toLowerCase()
  const filteredRows = data.rows.filter((row) =>
    row.map((cell) => (cell && typeof cell === 'object' ? cell.label || cell.status : cell)).join(' ').toLowerCase().includes(searchTerm),
  )

  return (
    <div className={`student-data-page ${data.className || ''}`}>
      <header className="student-page-header">
        <div>
          <span className="student-page-eyebrow">{data.eyebrow}</span>
          <h1>{data.title}</h1>
          <p>{data.description}</p>
        </div>
        <div className="student-page-actions">
          {data.actions.map((action, index) => (
            <button type="button" className={index === data.actions.length - 1 ? 'primary' : ''} key={action} onClick={() => onNotice(`${action} dipilih. Fitur ini tersedia setelah layanan sekolah terhubung.`)}>
              {index === data.actions.length - 1 ? <StudentIcon name="file" size={14} /> : <StudentIcon name="download" size={14} />}
              {action}
            </button>
          ))}
        </div>
      </header>

      <section className="student-metrics student-page-metrics" aria-label="Ringkasan">
        {data.stats.map(([title, value, detail, icon, tone], index) => (
          <article className="student-metric-card" key={`${title}-${index}`}>
            <div><h2>{title}</h2><strong>{value}</strong><p>{detail}</p></div>
            <span className={`student-metric-icon ${tone || ['red', 'blue', 'purple', 'orange'][index % 4]}`}><StudentIcon name={icon} size={16} /></span>
          </article>
        ))}
      </section>

      <section className="student-panel student-page-table-panel">
        <div className="student-page-table-toolbar">
          <label><span aria-hidden="true">⌕</span><input value={localSearch} onChange={(event) => setLocalSearch(event.target.value)} placeholder={data.searchPlaceholder} aria-label={data.searchPlaceholder} /></label>
          <span className="student-page-count">{filteredRows.length} data ditampilkan</span>
        </div>
        <div className="student-table-wrap">
          <table className="student-page-table">
            <thead><tr>{data.columns.map((column) => <th key={column}>{column}</th>)}<th>Aksi</th></tr></thead>
            <tbody>
              {filteredRows.map((row, rowIndex) => (
                <tr key={`${data.title}-${rowIndex}`}>
                  {row.map((cell, cellIndex) => <td key={`${rowIndex}-${cellIndex}`}>{renderCell(cell)}</td>)}
                  <td><button className="student-page-view" type="button" aria-label={`Lihat detail baris ${rowIndex + 1}`} onClick={() => onNotice(`Detail ${data.title.toLowerCase()} dipilih.`)}><StudentIcon name="eye" size={15} /></button></td>
                </tr>
              ))}
              {filteredRows.length === 0 && <tr><td className="student-page-empty" colSpan={data.columns.length + 1}>Data tidak ditemukan. Coba kata kunci lain.</td></tr>}
            </tbody>
          </table>
        </div>
        <footer className="student-page-table-footer">
          <span>Menampilkan {filteredRows.length} dari {data.rows.length} data</span>
          <div><button type="button" aria-label="Halaman sebelumnya" disabled>‹</button><strong>1</strong><button type="button" aria-label="Halaman selanjutnya" disabled>›</button></div>
        </footer>
      </section>
    </div>
  )
}

export default StudentDataPage
