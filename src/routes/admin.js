const {
  verifyMail,
  resendMail,
  login,
  registrationToken,
} = require('../controllers/admin');
const { auth, adminAuth } = require('../middleware/auth');
const { Router } = require('express');

const router = Router();

router.post('/login', login);
router.get('/verify', verifyMail);
router.post('/resend', resendMail);
router.post('/registration', [auth, adminAuth], registrationToken);

module.exports = router;
