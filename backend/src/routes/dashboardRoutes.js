const router = require('express').Router();
const controller = require('../controllers/dashboardController');
const auth = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const { asyncHandler } = require('../utils/http');

router.get('/operator', auth, authorizeRoles('OPERATOR'), asyncHandler(controller.operator));
router.get('/guru', auth, authorizeRoles('GURU'), asyncHandler(controller.teacher));

module.exports = router;
