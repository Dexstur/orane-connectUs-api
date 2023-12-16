const controller = require('../controllers/message');
const { auth, adminAuth } = require('../middleware/auth');
const { Router } = require('express');

const router = Router();

router.post('/:id', auth, controller.sendMessage);
router.get('/:id', auth, controller.readMessages);
router.delete('/:id', auth, controller.deleteMessage);

module.exports = router;
