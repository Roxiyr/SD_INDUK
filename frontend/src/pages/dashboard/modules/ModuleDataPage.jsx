import { useMemo, useState } from 'react'
import ModuleIcon from './ModuleIcon.jsx'

function ModuleDataPage({ module, data, search, notice, setNotice, onAddStudent, pageClassName = '' }) {
  const [tableSearch, setTableSearch] = useState('')
  const query = `${search} ${tableSearch}`.trim().toLowerCase()
  const filteredRows = useMemo(() => {
    if (!query) return data.rows
    return data.rows.filter((row) => row.some((cell) => cell.toLowerCase().includes(query)))
  }, [data.rows, query])

  function runAction(action) {
    if (action.includes('Tambah siswa')) {
      onAddStudent()
      return
    }
    setNotice(`${action} belum terhubung ke server. Data yang ditampilkan masih berupa contoh.`)
  }

  return (
    <section className={`module-view data-module-view ${pageClassName}`}>
      {notice && <div className="dashboard-notice" role="status">{notice}<button type="button" onClick={() => setNotice('')} aria-label="Tutup">×</button></div>}
      <div className="module-heading data-module-heading">
        <div><span className="module-eyebrow">{data.category}</span><h1>{module}</h1><p>{data.description}</p></div>
        <div className="module-toolbar">
          {(data.secondary || []).map((action) => (
            <button className="module-secondary-button" type="button" key={action} onClick={() => runAction(action)}>
              <ModuleIcon name={action.includes('Impor') ? 'download' : 'file'} size={15} />{action}
            </button>
          ))}
          {data.action && <button className="module-primary-button" type="button" onClick={() => runAction(data.action)}><ModuleIcon name={data.action.includes('Ekspor') || data.action.includes('Unduh') ? 'download' : 'plus'} size={16} />{data.action}</button>}
        </div>
      </div>

      <section className="metrics-grid module-metrics" aria-label={`Ringkasan ${module}`}>
        {data.metrics.map(([title, value, detail, icon], index) => (
          <article className="metric-card" key={title}>
            <div className="metric-copy"><h2>{title}</h2><strong className={value.length > 7 ? 'metric-long-value' : ''}>{value}</strong><p>{detail}</p></div>
            <span className={`metric-icon ${['red', 'blue', 'purple', 'orange'][index]}`}><ModuleIcon name={icon} size={18} /></span>
          </article>
        ))}
      </section>

      <section className="module-table-card">
        <div className="table-tools">
          <label className="table-search"><ModuleIcon name="search" size={16} /><input value={tableSearch} onChange={(event) => setTableSearch(event.target.value)} placeholder={`Cari di ${module.toLowerCase()}...`} aria-label={`Cari di ${module}`} /></label>
          <span className="table-count"><ModuleIcon name="settings" size={13} /> {filteredRows.length} data ditampilkan</span>
        </div>
        <div className="module-table-wrap">
          <table className="module-table">
            <thead><tr>{data.columns.map((column) => <th key={column}>{column}</th>)}<th className="action-heading">AKSI</th></tr></thead>
            <tbody>
              {filteredRows.length ? filteredRows.map((row, rowIndex) => (
                <tr key={`${module}-${row[0]}-${rowIndex}`}>
                  {row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`}>{cellIndex === 0 && /^\d+$/.test(cell) ? <span className="row-number">{cell}</span> : <CellValue value={cell} />}</td>)}
                  <td className="row-actions">
                    <button type="button" aria-label={`Lihat data ${row[1] || row[0]}`} onClick={() => setNotice(`Detail ${row[1] || row[0]} belum terhubung ke server.`)}><ModuleIcon name="eye" size={15} /></button>
                    <button type="button" aria-label={`Ubah data ${row[1] || row[0]}`} onClick={() => setNotice(`Form perubahan ${row[1] || row[0]} belum terhubung ke server.`)}><ModuleIcon name="edit" size={15} /></button>
                    <button type="button" aria-label={`Hapus data ${row[1] || row[0]}`} onClick={() => setNotice(`Penghapusan ${row[1] || row[0]} memerlukan konfirmasi server.`)}><ModuleIcon name="trash" size={15} /></button>
                  </td>
                </tr>
              )) : <tr><td className="empty-table" colSpan={data.columns.length + 1}>Tidak ada data yang cocok dengan pencarian.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="table-footer"><span>Menampilkan {filteredRows.length} dari {data.rows.length} data</span><div><button type="button" disabled aria-label="Halaman sebelumnya">‹</button><button type="button" className="current-page">1</button><button type="button" disabled aria-label="Halaman berikutnya">›</button></div></div>
      </section>
    </section>
  )
}

function CellValue({ value }) {
  if (/^(Aktif|Terverifikasi|Naik Kelas|Selesai|Diarsipkan|100% Siap|98,4% Siap|96,9% Siap|97,9% Siap)$/.test(value)) {
    return <span className="status-pill success"><i />{value}</span>
  }
  if (/^(Menunggu|Perlu|Dalam Proses|Cuti|Nonaktif)/.test(value)) {
    return <span className="status-pill pending"><i />{value}</span>
  }
  if (/^[A-Z]{1,2}\s{2,}/.test(value)) {
    const [initial, ...name] = value.split(/\s{2,}/)
    return <span className="table-person"><span>{initial}</span><strong>{name.join(' ')}</strong></span>
  }
  return value
}

export default ModuleDataPage
