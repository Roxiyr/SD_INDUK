const db = require('../config/database');
const { success, fail } = require('../utils/http');

const number = (value) => Number(value || 0);

async function getActiveAcademicYear() {
  const [rows] = await db.execute(
    `SELECT id_tahun_ajaran, nama_tahun_ajaran
     FROM tahun_ajaran
     WHERE status = 'Aktif'
     ORDER BY tanggal_mulai DESC, id_tahun_ajaran DESC
     LIMIT 1`,
  );
  return rows[0] || null;
}

async function getSchoolProfile() {
  const [rows] = await db.execute(
    `SELECT npsn, nama_sekolah, alamat, nomor_telepon, email, nama_kepala_sekolah, logo_lokasi
     FROM profil_sekolah
     ORDER BY id_profil_sekolah
     LIMIT 1`,
  );
  return rows[0] || null;
}

async function getAnnouncements(target, idKelas = null) {
  const targets = target === 'Guru'
    ? ['Semua', 'Guru']
    : ['Semua', 'Siswa', ...(idKelas ? ['Kelas'] : [])];
  const conditions = [
    "status = 'Terbit'",
    '(mulai_pada IS NULL OR mulai_pada <= NOW())',
    '(selesai_pada IS NULL OR selesai_pada >= NOW())',
  ];
  const values = [...targets];
  conditions.push(`target IN (${targets.map(() => '?').join(', ')})`);
  if (target === 'Siswa' && idKelas) {
    conditions.push("(target != 'Kelas' OR id_kelas = ?)");
    values.push(idKelas);
  } else {
    conditions.push("target != 'Kelas'");
  }
  const [rows] = await db.execute(
    `SELECT id_informasi, jenis, judul, isi, mulai_pada, selesai_pada
     FROM pengumuman_agenda
     WHERE ${conditions.join(' AND ')}
     ORDER BY COALESCE(mulai_pada, created_at) ASC
     LIMIT 5`,
    values,
  );
  return rows;
}

async function operator(req, res) {
  const activeYear = await getActiveAcademicYear();
  const school = await getSchoolProfile();
  const [[students]] = await db.execute(
    `SELECT COUNT(*) AS total,
            COALESCE(SUM(status_siswa = 'Aktif'), 0) AS aktif
     FROM siswa`,
  );
  const [[teachers]] = await db.execute(
    'SELECT COUNT(*) AS total FROM guru',
  );
  const [[classes]] = activeYear
    ? await db.execute(
      `SELECT COUNT(*) AS total
       FROM kelas
       WHERE id_tahun_ajaran = ? AND status = 'Aktif'`,
      [activeYear.id_tahun_ajaran],
    )
    : [[{ total: 0 }]];
  const [[reports]] = activeYear
    ? await db.execute(
      'SELECT COUNT(*) AS total FROM rapor_capaian WHERE tahun_pelajaran = ?',
      [activeYear.nama_tahun_ajaran],
    )
    : [[{ total: 0 }]];
  const [[documents]] = await db.execute(
    `SELECT COUNT(*) AS total,
            COALESCE(SUM(status_verifikasi = 'Terverifikasi'), 0) AS verified,
            COALESCE(SUM(status_verifikasi = 'Menunggu'), 0) AS pending
     FROM dokumen_siswa`,
  );
  const [[requests]] = await db.execute(
    "SELECT COUNT(*) AS total FROM pengajuan_perubahan_data WHERE status = 'Menunggu'",
  );
  const [[pendingReports]] = activeYear
    ? await db.execute(
      `SELECT COUNT(*) AS total
       FROM rapor_capaian r
       WHERE r.tahun_pelajaran = ?
         AND (SELECT rv.status FROM riwayat_verifikasi_rapor rv
              WHERE rv.id_rapor = r.id_rapor
              ORDER BY rv.id_verifikasi DESC LIMIT 1) = 'Diajukan'`,
      [activeYear.nama_tahun_ajaran],
    )
    : [[{ total: 0 }]];
  const [distribution] = activeYear
    ? await db.execute(
      `SELECT k.id_kelas, k.nama_kelas, k.tingkat, k.fase, COUNT(DISTINCT s.nisn) AS total_murid
       FROM kelas k
       LEFT JOIN siswa_kelas sk
         ON sk.id_kelas = k.id_kelas
        AND sk.id_tahun_ajaran = k.id_tahun_ajaran
        AND sk.status = 'Aktif'
       LEFT JOIN siswa s
         ON s.nisn = sk.nisn
        AND s.status_siswa = 'Aktif'
       WHERE k.id_tahun_ajaran = ? AND k.status = 'Aktif'
       GROUP BY k.id_kelas, k.nama_kelas, k.tingkat, k.fase
       ORDER BY k.tingkat, k.nama_kelas`,
      [activeYear.id_tahun_ajaran],
    )
    : [[]];

  return success(res, {
    school,
    academicYear: activeYear,
    metrics: {
      students: number(students.total),
      activeStudents: number(students.aktif),
      teachers: number(teachers.total),
      classes: number(classes.total),
      reports: number(reports.total),
      pendingReports: number(pendingReports.total),
      documents: number(documents.total),
      verifiedDocuments: number(documents.verified),
      pendingDocuments: number(documents.pending),
      pendingRequests: number(requests.total),
    },
    classDistribution: distribution.map((item) => ({
      ...item,
      total_murid: number(item.total_murid),
    })),
  });
}

async function teacher(req, res) {
  const [profileRows] = await db.execute(
    `SELECT g.nama_lengkap, g.id_guru, g.nip, g.nuptk, g.email, g.status
     FROM pengguna u
     LEFT JOIN guru g ON g.id_user = u.id_user
     WHERE u.id_user = ? AND u.role = 'GURU'
     LIMIT 1`,
    [req.user.id_user],
  );
  if (!profileRows.length) return fail(res, 404, 'Akun guru tidak ditemukan.');

  const profile = profileRows[0];
  if (!profile.id_guru || profile.status !== 'Aktif') {
    return fail(res, 403, 'Akun guru belum memiliki profil aktif. Hubungi operator sekolah.');
  }
  const activeYear = await getActiveAcademicYear();
  const school = await getSchoolProfile();
  let classes = [];
  let students = [];
  let subjects = [];
  let schedule = [];
  let reportStudents = 0;
  let p5Students = 0;
  let pendingRequests = 0;
  let attendance = { total: 0, present: 0 };

  if (profile.id_guru && activeYear) {
    const [classRows] = await db.execute(
      `SELECT DISTINCT k.id_kelas, k.nama_kelas, k.tingkat, k.fase,
              pg.peran, ta.nama_tahun_ajaran
       FROM penugasan_guru pg
       JOIN kelas k
         ON k.id_kelas = pg.id_kelas
        AND k.id_tahun_ajaran = pg.id_tahun_ajaran
       JOIN tahun_ajaran ta ON ta.id_tahun_ajaran = pg.id_tahun_ajaran
       WHERE pg.id_guru = ? AND pg.status = 'Aktif'
         AND k.status = 'Aktif' AND ta.id_tahun_ajaran = ?
       ORDER BY k.tingkat, k.nama_kelas`,
      [profile.id_guru, activeYear.id_tahun_ajaran],
    );
    classes = classRows;
    const classIds = classRows.map((item) => item.id_kelas);

    if (classIds.length) {
      const placeholders = classIds.map(() => '?').join(', ');
      const [studentRows] = await db.execute(
        `SELECT s.nisn, s.nama_lengkap, s.status_siswa, k.nama_kelas,
                ROUND(g.nilai_rata_rata, 1) AS nilai_rata_rata,
                COALESCE(a.hadir, 0) AS hadir,
                COALESCE(a.total_hari, 0) AS total_hari,
                COALESCE(p5.total, 0) AS catatan_p5
         FROM siswa_kelas sk
         JOIN siswa s ON s.nisn = sk.nisn
         JOIN kelas k ON k.id_kelas = sk.id_kelas
         LEFT JOIN (
           SELECT r.nisn, AVG(nm.nilai_akhir) AS nilai_rata_rata
           FROM rapor_capaian r
           JOIN nilai_mapel nm ON nm.id_rapor = r.id_rapor
           WHERE r.tahun_pelajaran = ?
           GROUP BY r.nisn
         ) g ON g.nisn = s.nisn
         LEFT JOIN (
           SELECT nisn, id_tahun_ajaran,
                  SUM(status_kehadiran = 'Hadir') AS hadir,
                  COUNT(*) AS total_hari
           FROM presensi_harian
           GROUP BY nisn, id_tahun_ajaran
         ) a ON a.nisn = s.nisn AND a.id_tahun_ajaran = sk.id_tahun_ajaran
         LEFT JOIN (
           SELECT r.nisn, COUNT(*) AS total
           FROM rapor_capaian r
           JOIN profil_pancasila p ON p.id_rapor = r.id_rapor
           WHERE r.tahun_pelajaran = ?
           GROUP BY r.nisn
         ) p5 ON p5.nisn = s.nisn
         WHERE sk.id_tahun_ajaran = ? AND sk.status = 'Aktif'
           AND sk.id_kelas IN (${placeholders}) AND s.status_siswa = 'Aktif'
         GROUP BY s.nisn, s.nama_lengkap, s.status_siswa, k.nama_kelas,
                  g.nilai_rata_rata, a.hadir, a.total_hari, p5.total
         ORDER BY s.nama_lengkap`,
        [activeYear.nama_tahun_ajaran, activeYear.nama_tahun_ajaran, activeYear.id_tahun_ajaran, ...classIds],
      );
      students = studentRows.map((item) => ({
        ...item,
        hadir: number(item.hadir),
        total_hari: number(item.total_hari),
        catatan_p5: number(item.catatan_p5),
        nilai_rata_rata: item.nilai_rata_rata === null ? null : number(item.nilai_rata_rata),
      }));

      const nisns = students.map((item) => item.nisn);
      if (nisns.length) {
        const studentPlaceholders = nisns.map(() => '?').join(', ');
        const [[reportCount]] = await db.execute(
          `SELECT COUNT(DISTINCT r.nisn) AS total
           FROM rapor_capaian r
           WHERE r.tahun_pelajaran = ? AND r.nisn IN (${studentPlaceholders})`,
          [activeYear.nama_tahun_ajaran, ...nisns],
        );
        reportStudents = number(reportCount.total);
        const [[p5Count]] = await db.execute(
          `SELECT COUNT(DISTINCT r.nisn) AS total
           FROM rapor_capaian r
           JOIN profil_pancasila p ON p.id_rapor = r.id_rapor
           WHERE r.tahun_pelajaran = ? AND r.nisn IN (${studentPlaceholders})`,
          [activeYear.nama_tahun_ajaran, ...nisns],
        );
        p5Students = number(p5Count.total);
        const [[requestCount]] = await db.execute(
          `SELECT COUNT(*) AS total
           FROM pengajuan_perubahan_data
           WHERE status = 'Menunggu' AND nisn IN (${studentPlaceholders})`,
          nisns,
        );
        pendingRequests = number(requestCount.total);
        const [[attendanceCount]] = await db.execute(
          `SELECT COUNT(*) AS total,
                  COALESCE(SUM(status_kehadiran = 'Hadir'), 0) AS present
           FROM presensi_harian
           WHERE id_tahun_ajaran = ? AND nisn IN (${studentPlaceholders})`,
          [activeYear.id_tahun_ajaran, ...nisns],
        );
        attendance = {
          total: number(attendanceCount.total),
          present: number(attendanceCount.present),
        };
      }

      const [subjectRows] = await db.execute(
        `SELECT DISTINCT m.id_mapel, m.nama_mapel
         FROM penugasan_guru pg
         JOIN mata_pelajaran m ON m.id_mapel = pg.id_mapel
         WHERE pg.id_guru = ? AND pg.id_tahun_ajaran = ?
           AND pg.status = 'Aktif' AND m.status = 'Aktif'
         ORDER BY m.nama_mapel`,
        [profile.id_guru, activeYear.id_tahun_ajaran],
      );
      subjects = subjectRows;

      const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const today = dayNames[new Date().getDay()];
      const [scheduleRows] = await db.execute(
        `SELECT j.id_jadwal, j.hari, j.jam_mulai, j.jam_selesai, j.ruang,
                k.nama_kelas, m.nama_mapel
         FROM jadwal_pelajaran j
         JOIN kelas k ON k.id_kelas = j.id_kelas
         JOIN mata_pelajaran m ON m.id_mapel = j.id_mapel
         WHERE j.id_guru = ? AND j.id_tahun_ajaran = ?
           AND j.hari = ? AND j.status = 'Aktif'
         ORDER BY j.jam_mulai`,
        [profile.id_guru, activeYear.id_tahun_ajaran, today],
      );
      schedule = scheduleRows;
    }
  }

  const announcements = await getAnnouncements('Guru');
  const reportProgress = students.length
    ? Math.round((reportStudents / students.length) * 100)
    : 0;

  return success(res, {
    school,
    profile: {
      registered: Boolean(profile.id_guru),
      name: profile.id_guru ? profile.nama_lengkap : null,
      nip: profile.nip,
      nuptk: profile.nuptk,
      email: profile.email,
    },
    academicYear: activeYear,
    classes,
    subjects,
    schedule,
    students,
    announcements,
    metrics: {
      students: students.length,
      reportStudents,
      reportProgress,
      p5Students,
      pendingRequests,
      attendanceRate: attendance.total
        ? Math.round((attendance.present / attendance.total) * 1000) / 10
        : null,
    },
  });
}

async function student(req, res) {
  if (!req.user.nisn) return fail(res, 403, 'Akun siswa belum terhubung ke data siswa.');

  const [studentRows] = await db.execute(
    `SELECT s.nisn, s.nis, s.nama_lengkap, s.nama_panggilan, s.status_siswa,
            s.jenis_kelamin, s.tempat_lahir, s.tanggal_lahir, s.agama, s.alamat,
            s.nomor_telepon, s.updated_at,
            k.nama_ayah, k.nama_ibu, k.nama_wali
     FROM siswa s
     LEFT JOIN keluarga_siswa k ON k.nisn = s.nisn
     WHERE s.nisn = ?
     LIMIT 1`,
    [req.user.nisn],
  );
  if (!studentRows.length) return fail(res, 404, 'Profil siswa tidak ditemukan.');

  const studentProfile = studentRows[0];
  const activeYear = await getActiveAcademicYear();
  const school = await getSchoolProfile();
  let classPlacement = null;
  let schedule = [];
  let reports = [];
  let grades = [];
  let reportStatus = 'Belum ada rapor';
  let attendance = { total: 0, present: 0 };
  let documents = { total: 0, verified: 0, pending: 0 };

  if (activeYear) {
    const [placementRows] = await db.execute(
      `SELECT k.id_kelas, k.nama_kelas, k.tingkat, k.fase,
              ta.nama_tahun_ajaran, g.nama_lengkap AS wali_kelas
       FROM siswa_kelas sk
       JOIN kelas k
         ON k.id_kelas = sk.id_kelas
        AND k.id_tahun_ajaran = sk.id_tahun_ajaran
       JOIN tahun_ajaran ta ON ta.id_tahun_ajaran = sk.id_tahun_ajaran
       LEFT JOIN penugasan_guru pg
         ON pg.id_kelas = k.id_kelas
        AND pg.id_tahun_ajaran = k.id_tahun_ajaran
        AND pg.peran = 'Wali Kelas'
        AND pg.status = 'Aktif'
       LEFT JOIN guru g ON g.id_guru = pg.id_guru
       WHERE sk.nisn = ? AND sk.id_tahun_ajaran = ? AND sk.status = 'Aktif'
       ORDER BY sk.tanggal_mulai DESC
       LIMIT 1`,
      [req.user.nisn, activeYear.id_tahun_ajaran],
    );
    classPlacement = placementRows[0] || null;

    if (classPlacement) {
      const [scheduleRows] = await db.execute(
        `SELECT j.id_jadwal, j.hari, j.jam_mulai, j.jam_selesai, j.ruang,
                mp.nama_mapel, g.nama_lengkap AS nama_guru
         FROM jadwal_pelajaran j
         JOIN mata_pelajaran mp ON mp.id_mapel = j.id_mapel
         JOIN guru g ON g.id_guru = j.id_guru
         WHERE j.id_kelas = ? AND j.id_tahun_ajaran = ? AND j.status = 'Aktif'
         ORDER BY FIELD(j.hari, 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'),
                  j.jam_mulai`,
        [classPlacement.id_kelas, activeYear.id_tahun_ajaran],
      );
      schedule = scheduleRows;
    }

    const [reportRows] = await db.execute(
      `SELECT r.id_rapor, r.kelas, r.fase, r.semester, r.tahun_pelajaran,
              r.absensi_sakit, r.absensi_izin, r.absensi_tanpa_ket,
              r.catatan_wali_kelas, r.keputusan_akhir,
              (SELECT ROUND(AVG(nm.nilai_akhir), 1)
               FROM nilai_mapel nm WHERE nm.id_rapor = r.id_rapor) AS nilai_rata_rata,
              COALESCE((SELECT rv.status FROM riwayat_verifikasi_rapor rv
                        WHERE rv.id_rapor = r.id_rapor
                        ORDER BY rv.id_verifikasi DESC LIMIT 1), 'Belum Diajukan') AS status_verifikasi
       FROM rapor_capaian r
       WHERE r.nisn = ? AND r.tahun_pelajaran = ?
       ORDER BY r.semester DESC, r.id_rapor DESC`,
      [req.user.nisn, activeYear.nama_tahun_ajaran],
    );
    reportStatus = reportRows[0]?.status_verifikasi || 'Belum ada rapor';
    reports = reportRows.filter((item) => item.status_verifikasi === 'Disetujui');
    if (reports.length) {
      const [gradeRows] = await db.execute(
        `SELECT kategori_mapel, nama_mapel, nilai_akhir, capaian_kompetensi
         FROM nilai_mapel
         WHERE id_rapor = ?
         ORDER BY nama_mapel`,
        [reports[0].id_rapor],
      );
      grades = gradeRows;
    }

    const [[attendanceCount]] = await db.execute(
      `SELECT COUNT(*) AS total,
              COALESCE(SUM(status_kehadiran = 'Hadir'), 0) AS present
       FROM presensi_harian
       WHERE nisn = ? AND id_tahun_ajaran = ?`,
      [req.user.nisn, activeYear.id_tahun_ajaran],
    );
    attendance = {
      total: number(attendanceCount.total),
      present: number(attendanceCount.present),
    };
  }

  const [[documentCount]] = await db.execute(
    `SELECT COUNT(*) AS total,
            COALESCE(SUM(status_verifikasi = 'Terverifikasi'), 0) AS verified,
            COALESCE(SUM(status_verifikasi = 'Menunggu'), 0) AS pending
     FROM dokumen_siswa
     WHERE nisn = ?`,
    [req.user.nisn],
  );
  documents = {
    total: number(documentCount.total),
    verified: number(documentCount.verified),
    pending: number(documentCount.pending),
  };

  const [[requestCount]] = await db.execute(
    `SELECT COUNT(*) AS total
     FROM pengajuan_perubahan_data
     WHERE nisn = ? AND status = 'Menunggu'`,
    [req.user.nisn],
  );
  const announcements = await getAnnouncements('Siswa', classPlacement?.id_kelas || null);
  const [[gradeAverage]] = reports.length
    ? await db.execute(
      'SELECT AVG(nilai_akhir) AS average FROM nilai_mapel WHERE id_rapor = ?',
      [reports[0].id_rapor],
    )
    : [[{ average: null }]];

  return success(res, {
    school,
    profile: studentProfile,
    classPlacement,
    schedule,
    academicYear: activeYear,
    report: reports[0] || null,
    reports,
    reportStatus,
    grades,
    announcements,
    metrics: {
      average: gradeAverage.average === null ? null : number(gradeAverage.average),
      attendanceRate: attendance.total
        ? Math.round((attendance.present / attendance.total) * 1000) / 10
        : null,
      attendancePresent: attendance.present,
      attendanceTotal: attendance.total,
      documents: documents.total,
      verifiedDocuments: documents.verified,
      pendingDocuments: documents.pending,
      pendingRequests: number(requestCount.total),
    },
  });
}

module.exports = { operator, teacher, student };
