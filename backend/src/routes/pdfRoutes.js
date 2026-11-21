const router = require('express').Router(); const auth = require('../middlewares/authMiddleware'); const { authorizeRoles } = require('../middlewares/roleMiddleware'); const { asyncHandler } = require('../utils/http'); const c = require('../controllers/pdfController');
router.get('/:nisn/pdf', auth, authorizeRoles('OPERATOR','GURU'), asyncHandler(c.renderBook));
module.exports = router;
