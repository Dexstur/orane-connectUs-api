const User = require('../models/user');
const Message = require('../models/message');
const mongoose = require('mongoose');

const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;

    if (!req.user) {
      return res.status(401).json({
        message: 'Unauthorized',
        error: 'You must be logged in to send a message',
      });
    }
    if (!content || !content.trim()) {
      return res.status(400).json({
        message: 'Bad request',
        error: 'Content is required',
      });
    }

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        message: 'Bad request',
        error: 'Recipient is required',
      });
    }

    const recipient = await User.findById(id);

    if (!recipient) {
      return res.status(404).json({
        message: 'Not found',
        error: 'Recipient not found',
      });
    }

    const message = await Message.create({
      content,
      author: req.user.id,
      recipient: recipient.id,
    });

    return res.status(201).json({
      message: 'Message sent',
      data: message,
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      message: 'Internal server error',
      error: err.message,
    });
  }
};

const readMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1 } = req.query;
    const limit = 20;
    if (!req.user) {
      return res.status(401).json({
        message: 'Unauthorized',
        error: 'You must be logged in to read messages',
      });
    }

    const user1 = new mongoose.Types.ObjectId(req.user.id);
    const user2 = new mongoose.Types.ObjectId(id);

    const messages = await Message.find({
      $or: [
        { author: user1, recipient: user2 },
        { author: user2, recipient: user1 },
      ],
    })
      .sort({ createdAt: 1 })
      .skip((Number(page) - 1) * limit)
      .limit(limit)
      .exec();

    const count = await Message.countDocuments({
      $or: [
        { author: user1, recipient: user2 },
        { author: user2, recipient: user1 },
      ],
    });

    const pages = Math.ceil(count / limit);

    return res.json({
      message: 'Messages',
      data: messages,
      page: Number(page),
      pages,
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      message: 'Internal server error',
      error: err.message,
    });
  }
};

//function to enable only the sender of a message to be able to delete a message. The person must be logged in actually.

const deleteMessage = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: 'Unauthorized',
        error: 'You must be logged in to delete messages',
      });
    }

    const messageId = req.params.id;
    const userId = req.user.id;

    // Find the message
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        message: 'Not found',
        error: 'Message not found',
      });
    }

    // Check if the logged-in user is the author of the message
    if (message.author.toString() !== userId) {
      return res.status(403).json({
        message: 'Forbidden',
        error: 'You can only delete your own messages',
      });
    }

    // Perform the "soft delete":A soft  delete does not remove the message from the database, only changes the content.
    message.content = 'This message has been deleted';
    await message.save();

    return res.json({
      message: 'Message deleted',
      data: message,
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      message: 'Internal server error',
      error: err.message,
    });
  }
};

module.exports = { sendMessage, readMessages, deleteMessage };
