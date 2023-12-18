const response = require('../controllers/response');
const { auth } = require('../middleware/auth');
const { Router } = require('express');

const router = Router();

// Assuming you want a user to be logged in to respond, so only 'auth' middleware is used.
router.post('/:id', auth, response.create);
router.get('/:id', auth, response.getAll); // Route for getting all responses
router.put('/:id', auth, response.edit); // Route for editing a response
router.delete('/:id', auth, response.deleteOne); // Route for deleting a response

module.exports = router;
