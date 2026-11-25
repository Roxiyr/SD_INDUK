import {useEffect,useMemo,useState} from 'react';

/** Menampilkan tabel dengan pencarian, filter pilihan, dan pagination lokal. @param {Object} props Kolom, rows, filters, dan renderer aksi. @returns {JSX.Element} Tabel responsif terfilter. */
export default function DataTable({columns,rows=[],searchKey='nama_lengkap',actions,filters=[],pageSize=10}){
  const [query,setQuery]=useState('');const [page,setPage]=useState(1);const [selected,setSelected]=useState({});
  const filtered=useMemo(()=>rows.filter(row=>{
    const searchable=[row[searchKey],row.nama_lengkap,row.nis,row.nisn].filter(Boolean).join(' ').toLowerCase();
    const matchesSearch=searchable.includes(query.toLowerCase());
    const matchesFilters=filters.every(filter=>!selected[filter.key]||String(row[filter.key]??'')===String(selected[filter.key]));
    return matchesSearch&&matchesFilters;
  }),[rows,query,searchKey,filters,selected]);
  useEffect(()=>setPage(1),[query,selected,rows.length]);
  const pageCount=Math.max(1,Math.ceil(filtered.length/pageSize));const visible=filtered.slice((page-1)*pageSize,page*pageSize);
  return <div className="table-card"><div className="table-tools"><input aria-label="Cari data" placeholder="Cari nama, NIS, atau NISN..." value={query} onChange={e=>setQuery(e.target.value)}/><div className="table-filters">{filters.map(filter=><label key={filter.key}>{filter.label}<select aria-label={filter.label} value={selected[filter.key]||''} onChange={e=>setSelected(current=>({...current,[filter.key]:e.target.value}))}><option value="">Semua</option>{filter.options.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select></label>)}<span>{filtered.length} data</span></div></div><div className="table-scroll"><table><thead><tr>{columns.map(column=><th key={column.key}>{column.label}</th>)}{actions&&<th>Aksi</th>}</tr></thead><tbody>{visible.map((row,index)=><tr key={row.nisn||row.id_kelas||row.id_guru||row.id_admin||row.id_mapel||row.id_user||row.id_penugasan||index}>{columns.map(column=><td key={column.key}>{column.render?column.render(row):row[column.key]??'—'}</td>)}{actions&&<td>{actions(row)}</td>}</tr>)}{!visible.length&&<tr><td colSpan={columns.length+(actions?1:0)} className="empty-state">Belum ada data yang cocok.</td></tr>}</tbody></table></div><footer className="table-pagination"><span>Menampilkan {filtered.length?((page-1)*pageSize)+1:0}–{Math.min(page*pageSize,filtered.length)} dari {filtered.length}</span><div><button className="button button-outline compact" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Sebelumnya</button><span>Halaman {page} / {pageCount}</span><button className="button button-outline compact" disabled={page>=pageCount} onClick={()=>setPage(p=>Math.min(pageCount,p+1))}>Berikutnya</button></div></footer></div>;
}
