const control = require('../controllers/feedback');
const { Router } = require('express');
const { auth, adminAuth } = require('../middleware/auth');

const router = Router();

router.post('/', auth, control.create);
router.get('/', auth, control.read);
router.delete('/:id', [auth, adminAuth], control.remove);
