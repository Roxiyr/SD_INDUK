const router = require('express').Router();
const controller = require('../controllers/pengajuanController');
const auth = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const { asyncHandler } = require('../utils/http');

router.use(auth);
router.get('/', authorizeRoles('OPERATOR', 'GURU', 'SISWA'), asyncHandler(controller.list));
router.post('/', authorizeRoles('GURU', 'SISWA'), asyncHandler(controller.create));
router.delete('/:id', authorizeRoles('SISWA'), asyncHandler(controller.cancel));
router.put('/:id', authorizeRoles('OPERATOR'), asyncHandler(controller.review));

module.exports = router;
