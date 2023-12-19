const Feedback = require('../models/feedback');

const create = async (req, res) => {
  try {
    //create a feedback. Feedbacks are anonymous so no user id is needed

    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: 'Bad request',
        error: 'Content is required',
      });
    }

    const feedback = await Feedback.create({
      content,
    });

    return res.status(201).json({
      message: 'Feedback recorded',
      data: feedback,
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      message: 'Internal Server Error',
      error: err.message,
    });
  }
};

const read = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const limit = 20;
    const feedbacks = await Feedback.find()
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * limit)
      .limit(limit)
      .exec();

    const count = await Feedback.countDocuments();
    const pages = Math.ceil(count / limit);

    return res.json({
      message: 'Feedbacks retrieved',
      data: feedbacks,
      page: Number(page),
      pages,
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      message: 'Internal Server Error',
      error: err.message,
    });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findById(id);

    if (!feedback) {
      return res.status(404).json({
        message: 'Not found',
        error: 'Feedback not found',
      });
    }

    await Feedback.deleteOne({ _id: id });

    return res.json({
      message: 'Feedback deleted',
      data: null,
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      message: 'Internal Server Error',
      error: err.message,
    });
  }
};

module.exports = { create, read, remove };
