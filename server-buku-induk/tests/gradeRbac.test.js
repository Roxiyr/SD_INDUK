jest.mock('../config/database',()=>({execute:jest.fn(),getConnection:jest.fn()}));
const pool=require('../config/database');const {getClassSheet,upsertNilaiMapel,upsertWaliKelas}=require('../controllers/gradeController');
const response=()=>({status:jest.fn().mockReturnThis(),json:jest.fn()});
const body={nisn:'0123456789',id_kelas:1,id_mapel:2,tahun_pelajaran:'2026/2027',semester:'Ganjil',nilai_akhir:88,capaian_kompetensi:'Mampu memahami materi.'};
describe('grade RBAC and validation',()=>{
 beforeEach(()=>{pool.execute.mockReset();pool.getConnection.mockReset();});
 test('getClassSheet mengembalikan roster siswa aktif terurut NIS dan nilai mapel terkelompok untuk guru mapel yang ditugaskan',async()=>{
  pool.execute
   .mockResolvedValueOnce([[{1:1}]])
   .mockResolvedValueOnce([[{nisn:'0123456789',nis:'1001',nama_lengkap:'Ayu',id_kelas:1,nama_kelas:'1A',id_rapor:12}]])
   .mockResolvedValueOnce([[{id_rapor:12,id_mapel:2,nama_mapel:'Matematika',nilai_akhir:90,capaian_kompetensi:'Baik'}]])
   .mockResolvedValueOnce([[]])
   .mockResolvedValueOnce([[]]);
  const res=response();
  await getClassSheet({query:{id_kelas:'1',id_mapel:'2',tahun_pelajaran:'2026/2027',semester:'Ganjil'},user:{role:'GURU',id_referensi:7}},res);
  expect(pool.execute).toHaveBeenCalledTimes(5);
  expect(pool.execute.mock.calls[1][0]).not.toContain('JSON_ARRAYAGG');
  expect(pool.execute.mock.calls[1][0]).toContain('LEFT JOIN kelas');
  expect(pool.execute.mock.calls[1][0]).toContain("UPPER(s.status_siswa) = 'AKTIF'");
  expect(pool.execute.mock.calls[1][0]).not.toContain('k.tahun_pelajaran = ?');
  expect(pool.execute.mock.calls[1][0]).toContain('ORDER BY s.nis ASC');
  expect(pool.execute.mock.calls[2][0]).toContain('AND n.id_mapel=?');
  expect(res.json).toHaveBeenCalledWith({
   data:[{
    nisn:'0123456789',
    nis:'1001',
    nama_lengkap:'Ayu',
    id_kelas:1,
    nama_kelas:'1A',
    id_rapor:12,
    nilai_mapel:[{id_mapel:2,nama_mapel:'Matematika',nilai_akhir:90,capaian_kompetensi:'Baik'}],
    profil_pancasila:[],
    nilai_ekstrakurikuler:[],
   }],
  });
 });
 test('getClassSheet mengembalikan roster wali kelas tanpa id_mapel beserta P5 dan ekstrakurikuler',async()=>{
  pool.execute
   .mockResolvedValueOnce([[{1:1}]])
   .mockResolvedValueOnce([[
    {nisn:'0123456789',nis:'1001',nama_lengkap:'Ayu',id_kelas:1,nama_kelas:'1A',id_rapor:12},
    {nisn:'0123456790',nis:'1002',nama_lengkap:'Bima',id_kelas:1,nama_kelas:'1A',id_rapor:null},
   ]])
   .mockResolvedValueOnce([[]])
   .mockResolvedValueOnce([[{id_rapor:12,dimensi:'Mandiri',elemen:'Regulasi diri',sub_elemen:'Disiplin',target_pencapaian:'BSH'}]])
   .mockResolvedValueOnce([[{id_rapor:12,id_ekskul_master:3,nama_ekskul:'Pramuka',predikat:'Baik',keterangan:'Aktif'}]]);
  const res=response();
  await getClassSheet({query:{id_kelas:'1',tahun_pelajaran:'2026/2027',semester:'Ganjil'},user:{role:'GURU',id_referensi:7}},res);
  expect(pool.execute).toHaveBeenCalledTimes(5);
  expect(pool.execute.mock.calls[2][0]).not.toContain('AND n.id_mapel=?');
  expect(res.json).toHaveBeenCalledWith({
   data:[
    {
     nisn:'0123456789',
     nis:'1001',
     nama_lengkap:'Ayu',
     id_kelas:1,
     nama_kelas:'1A',
     id_rapor:12,
     nilai_mapel:[],
     profil_pancasila:[{dimensi:'Mandiri',elemen:'Regulasi diri',sub_elemen:'Disiplin',target_pencapaian:'BSH'}],
     nilai_ekstrakurikuler:[{id_ekskul_master:3,nama_ekskul:'Pramuka',predikat:'Baik',keterangan:'Aktif'}],
    },
    {
     nisn:'0123456790',
     nis:'1002',
     nama_lengkap:'Bima',
     id_kelas:1,
     nama_kelas:'1A',
     id_rapor:null,
     nilai_mapel:[],
     profil_pancasila:[],
     nilai_ekstrakurikuler:[],
    },
   ],
  });
 });
 test('getClassSheet menolak guru tanpa id_referensi dengan 403 tanpa error 500',async()=>{
  const res=response();
  await getClassSheet({query:{id_kelas:'1',tahun_pelajaran:'2026/2027',semester:'Ganjil'},user:{role:'GURU'}},res);
  expect(res.status).toHaveBeenCalledWith(403);
  expect(pool.execute).not.toHaveBeenCalled();
 });
 test('getClassSheet menolak guru mapel yang tidak ditugaskan dengan 403',async()=>{
  pool.execute.mockResolvedValueOnce([[]]);
  const res=response();
  await getClassSheet({query:{id_kelas:'1',id_mapel:'2',tahun_pelajaran:'2026/2027',semester:'Ganjil'},user:{role:'GURU',id_referensi:7}},res);
  expect(res.status).toHaveBeenCalledWith(403);
 });
 test('menolak nilai di luar rentang 0-100',async()=>{const res=response();await upsertNilaiMapel({body:{...body,nilai_akhir:101},user:{role:'ADMIN'}},res);expect(res.status).toHaveBeenCalledWith(400);expect(pool.getConnection).not.toHaveBeenCalled();});
 test('guru ditolak jika kelas-mapel bukan penugasannya',async()=>{pool.execute.mockResolvedValue([[]]);const res=response();await upsertNilaiMapel({body,user:{role:'GURU',id_referensi:7}},res);expect(res.status).toHaveBeenCalledWith(403);expect(pool.getConnection).not.toHaveBeenCalled();});
 test('guru dengan penugasan dapat menyimpan nilai dan capaian',async()=>{pool.execute.mockResolvedValue([[{id_penugasan:1}]]);const connection={beginTransaction:jest.fn(),execute:jest.fn().mockResolvedValueOnce([[{nama_kelas:'1A',tingkat:1,fase:'Fase A'}]]).mockResolvedValueOnce([[{nisn:body.nisn}]]).mockResolvedValueOnce([[{id_mapel:2}]]).mockResolvedValueOnce([{}]).mockResolvedValueOnce([[{id_rapor:3}]]).mockResolvedValueOnce([{}]),commit:jest.fn(),rollback:jest.fn(),release:jest.fn()};pool.getConnection.mockResolvedValue(connection);const res=response();await upsertNilaiMapel({body,user:{role:'GURU',id_user:4,id_referensi:7}},res);expect(connection.commit).toHaveBeenCalled();expect(connection.execute).toHaveBeenCalledTimes(6);expect(res.json).toHaveBeenCalledWith({message:'Nilai tersimpan.'});});
 test('wali ditolak bila siswa bukan anggota kelas yang dipilih',async()=>{const connection={beginTransaction:jest.fn(),execute:jest.fn().mockResolvedValueOnce([[{id_kelas:1,id_wali_kelas:7,nama_kelas:'1A',tingkat:1,fase:'Fase A'}]]).mockResolvedValueOnce([[]]),rollback:jest.fn(),release:jest.fn()};pool.getConnection.mockResolvedValue(connection);const res=response();await upsertWaliKelas({body:{...body,absensi_sakit:0,absensi_izin:0,absensi_tanpa_ket:0},user:{role:'GURU',id_referensi:7,id_user:4}},res);expect(res.status).toHaveBeenCalledWith(400);expect(connection.rollback).toHaveBeenCalled();});
});
