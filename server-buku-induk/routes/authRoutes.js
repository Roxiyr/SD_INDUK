const express = require('express');
const auth = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');
const asyncHandler = require('../middlewares/asyncHandler');
const router = express.Router();
router.post('/auth/login', asyncHandler(auth.login));
router.get('/auth/me', verifyToken, asyncHandler(auth.getMe));
router.put('/auth/password', verifyToken, asyncHandler(auth.changePassword));
module.exports = router;
