const router = require('express').Router();
const controller = require('../controllers/jadwalController');
const auth = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const { asyncHandler } = require('../utils/http');

router.use(auth);
router.get('/', authorizeRoles('OPERATOR', 'GURU', 'SISWA'), asyncHandler(controller.list));
router.get('/options', authorizeRoles('OPERATOR', 'GURU'), asyncHandler(controller.options));
router.post('/', authorizeRoles('OPERATOR', 'GURU'), asyncHandler(controller.create));
router.put('/:id', authorizeRoles('OPERATOR', 'GURU'), asyncHandler(controller.update));
router.delete('/:id', authorizeRoles('OPERATOR', 'GURU'), asyncHandler(controller.remove));

module.exports = router;
