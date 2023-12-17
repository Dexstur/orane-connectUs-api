const express = require('express');
const router = express.Router();
const responseRoutes = require('./response');
const responseController = require('../controllers/response'); // Import the response controller
const { auth } = require('../middleware/auth'); // Import auth middleware

/* GET home page. */
router.get('/', function (req, res, next) {
  res.json({
    message: 'Welcome to the API',
    data: null,
  });
});

// Update routes for responses
router.post('/:noticeId/response', auth, responseController.createResponse);
router.get('/:noticeId/responses', auth, responseController.getAllResponses);
router.put('/response/:id', auth, responseController.editResponse); // Route for editing a response
router.delete('/response/:id', auth, responseController.deleteResponse); // Route for deleting a response

module.exports = router;

