const express = require('express');
const admin = require('../controllers/adminController');
const { verifyToken, requireRole } = require('../middlewares/authMiddleware');
const asyncHandler = require('../middlewares/asyncHandler');
const router = express.Router();
router.get(
  '/guru/dashboard',
  verifyToken,
  requireRole('GURU'),
  asyncHandler(admin.guruDashboard),
);
module.exports = router;
