jest.mock('../config/database',()=>({getConnection:jest.fn()}));
const XLSX=require('xlsx');const pool=require('../config/database');const {importExcel,schemas,parseExcelDate}=require('../controllers/importController');
const response=()=>({status:jest.fn().mockReturnThis(),json:jest.fn()});
function workbook(rows){const book=XLSX.utils.book_new();XLSX.utils.book_append_sheet(book,XLSX.utils.json_to_sheet(rows),'Data');return XLSX.write(book,{type:'buffer',bookType:'xlsx'});}
describe('Excel import',()=>{
 beforeEach(()=>pool.getConnection.mockReset());
 test('template siswa mencakup identitas, riwayat, dan keluarga',()=>{expect(schemas.siswa.fields).toContain('nisn');expect(schemas.siswa.history).toContain('status_masuk');expect(schemas.siswa.family).toContain('nama_ayah');expect(parseExcelDate('31/12/2020')).toBe('2020-12-31');});
 test('tanggal invalid dilaporkan dengan nomor baris',async()=>{const res=response();await importExcel({params:{entity:'siswa'},file:{buffer:workbook([{nisn:'0123456789',nis:'1',nama_lengkap:'Ayu',jenis_kelamin:'P',tempat_lahir:'Jakarta',tanggal_lahir:'31-12-2020',agama:'Islam',alamat:'Alamat'}])}},res);expect(res.status).toHaveBeenCalledWith(400);expect(res.json.mock.calls[0][0].errors[0]).toContain('Baris 2');expect(pool.getConnection).not.toHaveBeenCalled();});
 test('import siswa menulis ketiga tabel dalam satu transaksi',async()=>{const connection={beginTransaction:jest.fn(),execute:jest.fn().mockResolvedValue([{}]),commit:jest.fn(),rollback:jest.fn(),release:jest.fn()};pool.getConnection.mockResolvedValue(connection);const res=response();await importExcel({params:{entity:'siswa'},file:{buffer:workbook([{nisn:'0123456789',nis:'1',nama_lengkap:'Ayu',jenis_kelamin:'P',tempat_lahir:'Jakarta',tanggal_lahir:new Date('2018-01-02T00:00:00Z'),agama:'Islam',alamat:'Alamat'}])}},res);expect(connection.execute).toHaveBeenCalledTimes(3);expect(connection.commit).toHaveBeenCalled();expect(res.json.mock.calls[0][0].count).toBe(1);});
});
