const express = require('express');
const { signup, login } = require('../controllers/user');

const router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

router.post('/signup', signup);

module.exports = router;
