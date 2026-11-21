const router = require('express').Router();
const controller = require('../controllers/guruController');
const auth = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');
const { asyncHandler } = require('../utils/http');

router.use(auth, authorizeRoles('OPERATOR'));
router.get('/form-options', asyncHandler(controller.formOptions));
router.put('/akun/:id_user/profil', asyncHandler(controller.linkAccountProfile));
router.get('/', asyncHandler(controller.list));
router.post('/', asyncHandler(controller.create));
router.put('/:id', asyncHandler(controller.update));
router.delete('/:id', asyncHandler(controller.remove));

module.exports = router;
