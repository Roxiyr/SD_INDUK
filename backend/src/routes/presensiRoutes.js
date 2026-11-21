const router = require('express').Router();
const controller = require('../controllers/presensiController');
const auth = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const { asyncHandler } = require('../utils/http');

router.use(auth, authorizeRoles('OPERATOR', 'GURU'));
router.get('/', asyncHandler(controller.list));
router.post('/batch', asyncHandler(controller.save));

module.exports = router;
