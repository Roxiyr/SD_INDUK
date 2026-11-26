const express = require('express');
const students = require('../controllers/studentController');
const grades = require('../controllers/gradeController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const asyncHandler = require('../middlewares/asyncHandler');
const router = express.Router();
router.get(
  '/students',
  verifyToken,
  requireRole('ADMIN', 'GURU'),
  asyncHandler(students.getAllStudents),
);
router.post(
  '/students',
  verifyToken,
  requireRole('ADMIN'),
  asyncHandler(students.createStudent),
);
router.get(
  '/students/:nisn/buku-induk',
  verifyToken,
  requireRole('ADMIN', 'GURU'),
  asyncHandler(grades.getBukuIndukByNisn),
);
router.get(
  '/students/:nisn',
  verifyToken,
  requireRole('ADMIN', 'GURU'),
  asyncHandler(students.getStudentDetail),
);
router.put(
  '/students/:nisn',
  verifyToken,
  requireRole('ADMIN'),
  asyncHandler(students.updateStudent),
);
router.delete(
  '/students/:nisn',
  verifyToken,
  requireRole('ADMIN'),
  asyncHandler(students.deleteStudent),
);
module.exports = router;
