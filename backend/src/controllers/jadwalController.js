const db = require('../config/database');
const { success, fail } = require('../utils/http');

const days = new Set(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']);

async function activeYear() {
  const [[year]] = await db.execute(
    "SELECT id_tahun_ajaran, nama_tahun_ajaran FROM tahun_ajaran WHERE status = 'Aktif' LIMIT 1",
  );
  return year || null;
}

async function options(req, res) {
  const year = await activeYear();
  if (!year) return success(res, { classes: [], teachers: [], subjects: [] });

  const teacherOnly = req.user.role === 'GURU';
  const [classes] = await db.execute(
    `SELECT DISTINCT k.id_kelas, k.nama_kelas, k.tingkat
     FROM kelas k
     ${teacherOnly ? `JOIN penugasan_guru pg
       ON pg.id_kelas = k.id_kelas AND pg.id_tahun_ajaran = k.id_tahun_ajaran
       JOIN guru own ON own.id_guru = pg.id_guru AND own.id_user = ?` : ''}
     WHERE k.id_tahun_ajaran = ? AND k.status = 'Aktif'
       ${teacherOnly ? "AND pg.status = 'Aktif' AND own.status = 'Aktif'" : ''}
     ORDER BY k.tingkat, k.nama_kelas`,
    teacherOnly ? [req.user.id_user, year.id_tahun_ajaran] : [year.id_tahun_ajaran],
  );
  const [teachers] = teacherOnly
    ? await db.execute(
      `SELECT DISTINCT g.id_guru, g.nama_lengkap
       FROM guru g
       WHERE g.id_user = ? AND g.status = 'Aktif'`,
      [req.user.id_user],
    )
    : await db.execute(
      "SELECT id_guru, nama_lengkap FROM guru WHERE status = 'Aktif' ORDER BY nama_lengkap",
    );
  const [subjects] = teacherOnly
    ? await db.execute(
      `SELECT DISTINCT m.id_mapel, m.nama_mapel
       FROM mata_pelajaran m
       JOIN penugasan_guru pg ON pg.id_mapel = m.id_mapel OR pg.peran = 'Wali Kelas'
       JOIN guru g ON g.id_guru = pg.id_guru
       WHERE g.id_user = ? AND g.status = 'Aktif'
         AND pg.id_tahun_ajaran = ? AND pg.status = 'Aktif'
         AND (pg.id_mapel = m.id_mapel OR pg.peran = 'Wali Kelas')
         AND m.status = 'Aktif'
       ORDER BY m.nama_mapel`,
      [req.user.id_user, year.id_tahun_ajaran],
    )
    : await db.execute(
      "SELECT id_mapel, nama_mapel FROM mata_pelajaran WHERE status = 'Aktif' ORDER BY nama_mapel",
    );
  return success(res, { classes, teachers, subjects, academicYear: year.nama_tahun_ajaran });
}

async function list(req, res) {
  const year = await activeYear();
  if (!year) return success(res, { schedules: [], academicYear: null });
  const classId = req.query.id_kelas === undefined ? null : Number(req.query.id_kelas);
  if (classId !== null && (!Number.isInteger(classId) || classId < 1)) {
    return fail(res, 400, 'ID kelas tidak valid.');
  }
  const conditions = ['j.id_tahun_ajaran = ?', "j.status = 'Aktif'"];
  const params = [year.id_tahun_ajaran];
  if (req.user.role === 'GURU') {
    conditions.push(`EXISTS (
      SELECT 1 FROM guru own
      WHERE own.id_guru = j.id_guru AND own.id_user = ? AND own.status = 'Aktif'
    )`);
    params.push(req.user.id_user);
    conditions.push(`EXISTS (
      SELECT 1 FROM penugasan_guru pg
      WHERE pg.id_guru = j.id_guru AND pg.id_kelas = j.id_kelas
        AND pg.id_tahun_ajaran = j.id_tahun_ajaran AND pg.status = 'Aktif'
    )`);
  } else if (req.user.role === 'SISWA') {
    conditions.push(`EXISTS (
      SELECT 1 FROM siswa_kelas sk
      WHERE sk.id_kelas = j.id_kelas AND sk.id_tahun_ajaran = j.id_tahun_ajaran
        AND sk.nisn = ? AND sk.status = 'Aktif'
    )`);
    params.push(req.user.nisn);
  }
  if (classId !== null) {
    conditions.push('j.id_kelas = ?');
    params.push(classId);
  }
  const [schedules] = await db.execute(
    `SELECT j.id_jadwal, j.id_kelas, j.id_guru, j.id_mapel, j.hari,
            j.jam_mulai, j.jam_selesai, j.ruang,
            k.nama_kelas, k.tingkat, g.nama_lengkap AS nama_guru, m.nama_mapel
     FROM jadwal_pelajaran j
     JOIN kelas k ON k.id_kelas = j.id_kelas AND k.id_tahun_ajaran = j.id_tahun_ajaran
     JOIN guru g ON g.id_guru = j.id_guru
     JOIN mata_pelajaran m ON m.id_mapel = j.id_mapel
     WHERE ${conditions.join(' AND ')}
     ORDER BY FIELD(j.hari, 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'),
              j.jam_mulai, k.nama_kelas`,
    params,
  );
  return success(res, { schedules, academicYear: year.nama_tahun_pelajaran || year.nama_tahun_ajaran });
}

function parseSchedule(body) {
  const idKelas = Number(body?.id_kelas);
  const idGuru = body?.id_guru === undefined ? null : Number(body.id_guru);
  const idMapel = Number(body?.id_mapel);
  const start = body?.jam_mulai;
  const end = body?.jam_selesai;
  const room = body?.ruang;
  if (!Number.isInteger(idKelas) || idKelas < 1
      || (idGuru !== null && (!Number.isInteger(idGuru) || idGuru < 1))
      || !Number.isInteger(idMapel) || idMapel < 1
      || !days.has(body?.hari)
      || typeof start !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(start)
      || typeof end !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(end)
      || (room !== undefined && room !== null && (typeof room !== 'string' || room.length > 50))) return null;
  const seconds = (value) => {
    const [hour, minute, second = 0] = value.split(':').map(Number);
    return hour * 3600 + minute * 60 + second;
  };
  if (seconds(start) >= seconds(end)) return null;
  return { idKelas, idGuru, idMapel, day: body.hari, start, end, room: room?.trim() || null };
}

async function save(req, res, scheduleId = null) {
  const schedule = parseSchedule(req.body);
  if (!schedule) return fail(res, 400, 'Kelas, guru, mapel, hari, waktu, atau ruang tidak valid.');
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [years] = await conn.execute(
      "SELECT id_tahun_ajaran FROM tahun_ajaran WHERE status = 'Aktif' LIMIT 1",
    );
    if (!years.length) {
      await conn.rollback();
      return fail(res, 409, 'Tahun ajaran aktif belum tersedia.');
    }
    const yearId = years[0].id_tahun_ajaran;
    let teacherId = schedule.idGuru;
    if (req.user.role === 'GURU') {
      const [own] = await conn.execute(
        "SELECT id_guru FROM guru WHERE id_user = ? AND status = 'Aktif' LIMIT 1",
        [req.user.id_user],
      );
      if (!own.length) {
        await conn.rollback();
        return fail(res, 403, 'Profil guru aktif tidak ditemukan.');
      }
      teacherId = own[0].id_guru;
      if (schedule.idGuru !== null && Number(schedule.idGuru) !== Number(teacherId)) {
        await conn.rollback();
        return fail(res, 403, 'Guru hanya dapat mengelola jadwalnya sendiri.');
      }
    }
    if (scheduleId !== null) {
      const [existing] = await conn.execute(
        `SELECT id_jadwal FROM jadwal_pelajaran
         WHERE id_jadwal = ? AND id_tahun_ajaran = ? AND status = 'Aktif'
           ${req.user.role === 'GURU' ? 'AND id_guru = ?' : ''}
         FOR UPDATE`,
        req.user.role === 'GURU'
          ? [scheduleId, yearId, teacherId]
          : [scheduleId, yearId],
      );
      if (!existing.length) {
        await conn.rollback();
        return fail(res, 404, 'Jadwal tidak ditemukan atau bukan milik guru ini.');
      }
    }
    const [classes] = await conn.execute(
      `SELECT id_kelas FROM kelas
       WHERE id_kelas = ? AND id_tahun_ajaran = ? AND status = 'Aktif'
       FOR UPDATE`,
      [schedule.idKelas, yearId],
    );
    if (!classes.length) {
      await conn.rollback();
      return fail(res, 400, 'Kelas tidak aktif pada tahun ajaran berjalan.');
    }
    const [teachers] = await conn.execute(
      "SELECT id_guru FROM guru WHERE id_guru = ? AND status = 'Aktif' FOR UPDATE",
      [teacherId],
    );
    const [subjects] = await conn.execute(
      "SELECT id_mapel FROM mata_pelajaran WHERE id_mapel = ? AND status = 'Aktif'",
      [schedule.idMapel],
    );
    if (!teachers.length || !subjects.length) {
      await conn.rollback();
      return fail(res, 400, 'Guru atau mata pelajaran tidak aktif.');
    }
    const [assignments] = await conn.execute(
      `SELECT id_penugasan FROM penugasan_guru
       WHERE id_guru = ? AND id_kelas = ? AND id_tahun_ajaran = ?
         AND status = 'Aktif'
         AND (id_mapel = ? OR peran = 'Wali Kelas')
       LIMIT 1`,
      [teacherId, schedule.idKelas, yearId, schedule.idMapel],
    );
    if (!assignments.length) {
      await conn.rollback();
      return fail(res, 403, 'Guru belum ditugaskan pada kelas dan mata pelajaran tersebut.');
    }
    const [overlaps] = await conn.execute(
      `SELECT id_jadwal FROM jadwal_pelajaran
       WHERE id_tahun_ajaran = ? AND hari = ? AND status = 'Aktif'
         AND (id_kelas = ? OR id_guru = ?)
         AND jam_mulai < ? AND jam_selesai > ?
         AND (? IS NULL OR id_jadwal <> ?)
       LIMIT 1`,
      [yearId, schedule.day, schedule.idKelas, teacherId, schedule.end, schedule.start, scheduleId, scheduleId],
    );
    if (overlaps.length) {
      await conn.rollback();
      return fail(res, 409, 'Jadwal bertabrakan dengan jadwal lain di kelas atau guru tersebut.');
    }
    if (scheduleId === null) {
      const [result] = await conn.execute(
        `INSERT INTO jadwal_pelajaran
          (id_kelas, id_tahun_ajaran, id_guru, id_mapel, hari, jam_mulai, jam_selesai, ruang)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [schedule.idKelas, yearId, teacherId, schedule.idMapel, schedule.day, schedule.start, schedule.end, schedule.room],
      );
      await conn.commit();
      return success(res, { id_jadwal: result.insertId }, 'Jadwal berhasil ditambahkan.', 201);
    }
    await conn.execute(
      `UPDATE jadwal_pelajaran
       SET id_kelas = ?, id_guru = ?, id_mapel = ?, hari = ?,
           jam_mulai = ?, jam_selesai = ?, ruang = ?
       WHERE id_jadwal = ? AND id_tahun_ajaran = ?`,
      [schedule.idKelas, teacherId, schedule.idMapel, schedule.day, schedule.start, schedule.end, schedule.room, scheduleId, yearId],
    );
    await conn.commit();
    return success(res, { id_jadwal: scheduleId }, 'Jadwal berhasil diperbarui.');
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

async function create(req, res) {
  return save(req, res);
}

async function update(req, res) {
  const scheduleId = Number(req.params.id);
  if (!Number.isInteger(scheduleId) || scheduleId < 1) return fail(res, 400, 'ID jadwal tidak valid.');
  return save(req, res, scheduleId);
}

async function remove(req, res) {
  const scheduleId = Number(req.params.id);
  if (!Number.isInteger(scheduleId) || scheduleId < 1) return fail(res, 400, 'ID jadwal tidak valid.');
  const params = [scheduleId];
  let teacherCondition = '';
  if (req.user.role === 'GURU') {
    teacherCondition = `AND j.id_guru = (SELECT id_guru FROM guru WHERE id_user = ? AND status = 'Aktif' LIMIT 1)
      AND EXISTS (
        SELECT 1 FROM penugasan_guru pg
        WHERE pg.id_guru = j.id_guru AND pg.id_kelas = j.id_kelas
          AND pg.id_tahun_ajaran = j.id_tahun_ajaran AND pg.status = 'Aktif'
      )`;
    params.push(req.user.id_user);
  }
  const [result] = await db.execute(
    `UPDATE jadwal_pelajaran j
     JOIN tahun_ajaran ta ON ta.id_tahun_ajaran = j.id_tahun_ajaran AND ta.status = 'Aktif'
     SET j.status = 'Nonaktif'
     WHERE j.id_jadwal = ? AND j.status = 'Aktif' ${teacherCondition}`,
    params,
  );
  if (!result.affectedRows) return fail(res, 404, 'Jadwal tidak ditemukan atau bukan milik guru ini.');
  return success(res, null, 'Jadwal dinonaktifkan.');
}

module.exports = { options, list, create, update, remove };
