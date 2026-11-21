const router = require('express').Router(); const c = require('../controllers/userController'); const auth = require('../middlewares/authMiddleware'); const { authorizeRoles } = require('../middlewares/roleMiddleware'); const { asyncHandler } = require('../utils/http');
router.use(auth, authorizeRoles('OPERATOR')); router.get('/', asyncHandler(c.list)); router.post('/', asyncHandler(c.create)); router.put('/:id', asyncHandler(c.update)); router.delete('/:id', asyncHandler(c.remove));
module.exports = router;
