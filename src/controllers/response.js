const User = require('../models/user');
const Response = require('../models/response');
const Notice = require('../models/notice');

const create = async (req, res) => {
  try {
    const noticeId = req.params.id;
    const { content } = req.body;

    // Check if the user is logged in
    if (!req.user) {
      return res.status(401).json({
        message: 'Unauthorized',
        error: 'You must be logged in to respond',
      });
    }

    // Check if content or noticeId is empty
    if (!content || content.trim() === '' || !noticeId) {
      return res.status(400).json({
        message: 'Bad request',
        error: 'Content and noticeId cannot be empty',
      });
    }

    // Check if the notice exists
    const notice = await Notice.findById(noticeId);
    if (!notice) {
      return res.status(404).json({
        message: 'Not found',
        error: 'Notice not found',
      });
    }

    // Create response
    const response = await Response.create({
      content,
      user: req.user.id,
      notice: noticeId,
    });

    notice.responses.push(response.id);
    await notice.save();

    return res.status(201).json({
      message: 'Response created',
      data: response,
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      message: 'Internal server error',
      error: err.message,
    });
  }
};

const deleteOne = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the user is logged in
    if (!req.user) {
      return res.status(401).json({
        message: 'Unauthorized',
        error: 'You must be logged in to delete a response',
      });
    }

    // Find the response
    const response = await Response.findById(id);
    if (!response) {
      return res.status(404).json({
        message: 'Not found',
        error: 'Response not found',
      });
    }

    // Check if the logged-in user is the creator of the response
    if (response.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Forbidden',
        error: 'You can only delete your own responses',
      });
    }

    // Soft delete: mark the response as deleted
    response.deleted = true;
    await response.save();

    return res.json({
      message: 'Response deleted',
      data: response,
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      message: 'Internal server error',
      error: err.message,
    });
  }
};

const edit = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    // Check if the user is logged in
    if (!req.user) {
      return res.status(401).json({
        message: 'Unauthorized',
        error: 'You must be logged in to edit a response',
      });
    }

    // Find the response
    const response = await Response.findById(id);
    if (!response) {
      return res.status(404).json({
        message: 'Not found',
        error: 'Response not found',
      });
    }

    // Check if the logged-in user is the creator of the response
    if (response.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Forbidden',
        error: 'You can only edit your own responses',
      });
    }

    // Update the response content
    response.content = content;
    await response.save();

    return res.json({
      message: 'Response edited',
      data: response,
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      message: 'Internal server error',
      error: err.message,
    });
  }
};

const getAll = async (req, res) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findById(id);

    if (!notice) {
      return res.status(404).json({
        message: 'Not found',
        error: 'Notice not found',
      });
    }
    const responses = await Response.find({ notice: id, deleted: false })
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .populate('user', 'fullname') // Populate the 'user' field with 'fullname'
      .exec();

    return res.json({
      message: 'All responses',
      data: responses,
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      message: 'Internal server error',
      error: err.message,
    });
  }
};

module.exports = { create, deleteOne, edit, getAll };
