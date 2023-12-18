const express = require('express');
const {
  signup,
  login,
  allStaff,
  regularStaff,
  adminStaff,
  onLeave,
  logout,
} = require('../controllers/user');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', signup);
router.post('/login', login);
router.get('/all', auth, allStaff);
router.get('/regular', auth, regularStaff);
router.get('/admin', [auth, adminAuth], adminStaff);
router.get('/leave', auth, onLeave);
router.post('/logout', auth, logout);

module.exports = router;
