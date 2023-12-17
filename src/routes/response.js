const responseController = require('../controllers/response');
const { auth } = require('../middleware/auth');
const { Router } = require('express');

const router = Router();

// Assuming you want a user to be logged in to respond, so only 'auth' middleware is used.
router.post('/', auth, responseController.createResponse);
router.get('/', auth, responseController.getAllResponses); // Route for getting all responses
router.put('/:id', auth, responseController.editResponse); // Route for editing a response
router.delete('/:id', auth, responseController.deleteResponse); // Route for deleting a response

module.exports = router;

