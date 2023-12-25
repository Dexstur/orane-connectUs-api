const controller = require('../controllers/notice');
const { auth, adminAuth } = require('../middleware/auth');
const { Router } = require('express');

const router = Router();

router.post('/', [auth, adminAuth], controller.createNotice);
router.get('/', auth, controller.all);
router.get('/:id', auth, controller.viewOne);
router.put('/leave', [auth, adminAuth], controller.leaveNotice);
router.put('/leave/:id', [auth, adminAuth], controller.returnFromLeave);
router.put('/:id', [auth, adminAuth], controller.updateNotice);

module.exports = router;
