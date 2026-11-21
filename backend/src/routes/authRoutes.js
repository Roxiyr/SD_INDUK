const router = require('express').Router(); const c = require('../controllers/authController'); const auth = require('../middlewares/authMiddleware'); const { asyncHandler } = require('../utils/http');
router.post('/login', asyncHandler(c.login)); router.get('/me', auth, asyncHandler(c.me)); router.put('/password', auth, asyncHandler(c.changePassword));
module.exports = router;
