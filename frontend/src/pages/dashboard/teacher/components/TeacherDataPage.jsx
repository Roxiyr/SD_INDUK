import { useState } from 'react'

function Icon({ name, size = 15 }) {
  const paths = {
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    activity: <><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></>,
    clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4.5h6a1.5 1.5 0 0 0-3-1 1.5 1.5 0 0 0-3 1ZM9 11h6m-6 4h6" /></>,
    shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
    book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v17H6.5A2.5 2.5 0 0 1 4 17.5z" /><path d="M4 17.5A2.5 2.5 0 0 1 6.5 15H20" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.6.9l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.6-.9l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-1.9l-1.4-1.1 1.4-2.4 1.7.7a8 8 0 0 1 1.6-.9l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.6.9l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1-.1 1.8Z" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    sliders: <><path d="M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3M2 14h4m4-6h4m4 8h4" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 10 5 5 5-5m-5 5V3" /></>,
    plus: <><path d="M12 5v14m-7-7h14" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></>,
    edit: <><path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16z" /></>,
    trash: <><path d="M3 6h18m-2 0-.9 14H5.9L5 6m4 0V4h6v2m-5 4v6m4-6v6" /></>,
  }
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name] || paths.clipboard}</svg>
}

function TeacherDataPage({ module, data, search, onNotice, pageClassName = '' }) {
  const [tableSearch, setTableSearch] = useState('')
  const query = `${tableSearch} ${search}`.trim().toLowerCase()
  const rows = data.rows.filter(([name, letter, cells]) =>
    `${name} ${letter} ${cells.map((cell) => typeof cell === 'string' ? cell : cell.status).join(' ')}`.toLowerCase().includes(query),
  )

  function exportCsv() {
    const csvRows = [
      ['No', 'Nama siswa', ...data.columns],
      ...rows.map(([name, , cells], index) => [String(index + 1), name, ...cells.map((cell) => typeof cell === 'string' ? cell : cell.status)]),
    ]
    const csv = csvRows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob(['\uFEFF', csv], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `${module.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}.csv`
    link.click()
    URL.revokeObjectURL(url)
    onNotice('File CSV berhasil diunduh.')
  }

  const isProfile = module === 'Profil Guru & Akun'

  return (
    <section className={`teacher-module-screen ${pageClassName}`}>
      <div className="teacher-module-heading">
        <div><span className="teacher-module-eyebrow">{data.eyebrow}</span><h1>{data.title}</h1><p>{data.description}</p></div>
        <div className="teacher-module-actions">
          <button type="button" className="teacher-secondary-action" onClick={exportCsv}><Icon name="download" />Ekspor CSV</button>
          <button type="button" className="teacher-primary-action" onClick={() => onNotice(`${data.action} dipilih.`)}>
            <Icon name={module === 'Input Nilai & Asesmen' || module === 'Verifikasi Rapor Siswa' || isProfile ? 'check' : 'plus'} />{data.action}
          </button>
        </div>
      </div>

      <div className="teacher-module-metrics">
        {data.stats.map(([title, value, detail, icon], index) => <ModuleMetric key={title} title={title} value={value} detail={detail} icon={icon} tone={['red', 'blue', 'purple', 'orange'][index]} />)}
      </div>

      <section className="teacher-module-table-card">
        <div className="teacher-table-toolbar">
          <label className="teacher-table-search"><Icon name="search" /><input value={tableSearch} onChange={(event) => setTableSearch(event.target.value)} placeholder={data.searchPlaceholder} aria-label={`Cari ${module}`} /></label>
          <span className="teacher-table-count"><Icon name="sliders" size={13} />{rows.length} data ditampilkan</span>
        </div>
        <div className="teacher-module-table-wrap">
          <table className="teacher-module-table">
            <thead><tr><th>No</th><th>{isProfile ? 'Informasi' : 'Nama siswa'}</th>{data.columns.map((column) => <th key={column}>{column}</th>)}<th>Aksi</th></tr></thead>
            <tbody>
              {rows.map(([name, letter, cells], index) => (
                <tr key={`${name}-${index}`}>
                  <td className="teacher-row-number">{String(index + 1).padStart(2, '0')}</td>
                  <td><div className="teacher-row-identity"><span className="teacher-row-initial">{letter}</span><strong>{name}</strong></div></td>
                  {cells.map((cell, cellIndex) => <td key={`${name}-${cellIndex}`}>{typeof cell === 'string' ? cell : <span className="teacher-status-badge">{cell.status}</span>}</td>)}
                  <td><div className="teacher-row-actions">
                    <button type="button" aria-label={`Lihat ${name}`} title="Lihat" onClick={() => onNotice(`Detail ${name} dipilih.`)}><Icon name="eye" /></button>
                    <button type="button" aria-label={`Ubah ${name}`} title="Ubah" onClick={() => onNotice(`Form perubahan ${name} dipilih.`)}><Icon name="edit" /></button>
                    <button type="button" aria-label={`Hapus ${name}`} title="Hapus" onClick={() => onNotice(`Konfirmasi penghapusan ${name} diperlukan.`)}><Icon name="trash" /></button>
                  </div></td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td className="teacher-table-empty" colSpan={data.columns.length + 3}>Tidak ada data yang cocok dengan pencarian.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="teacher-table-footer"><span>Menampilkan {rows.length} dari {data.rows.length} data</span><div className="teacher-pagination"><button type="button" aria-label="Halaman sebelumnya" disabled>‹</button><button type="button" className="current">1</button><button type="button" aria-label="Halaman selanjutnya" disabled>›</button></div></div>
      </section>
    </section>
  )
}

function ModuleMetric({ title, value, detail, icon, tone }) {
  return (
    <article className="teacher-module-metric">
      <div><h2>{title}</h2><strong>{value}</strong><p>{detail}</p></div>
      <span className={`teacher-module-metric-icon ${tone}`}><Icon name={icon} size={17} /></span>
    </article>
  )
}

export default TeacherDataPage
