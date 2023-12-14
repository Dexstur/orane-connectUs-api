const User = require('../models/user');
const Notice = require('../models/notice');
const dev = require('../utils/log');

const createNotice = async (req, res) => {
  try {
    //create notice. The user ref will come from the req.user object (req.user.id)
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      message: 'Internal server error',
      error: err.message,
    });
  }
};

const all = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const limit = 20;

    const data = await Notice.find({})
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((Number(page) - 1) * limit)
      .exec();

    const count = await Notice.countDocuments();
    const pages = Math.ceil(count / limit);

    return res.status(200).json({
      message: 'Notices',
      data,
      page,
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

const leaveNotice = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(404).json({
        message: 'Not found',
        error: 'User not found',
      });
    }

    if (user._id.toString() === req.user.id) {
      return res.status(403).json({
        message: 'Forbidden',
        error: 'You cannot send yourself on leave',
      });
    }

    if (user.leave) {
      return res.status(409).json({
        message: 'Conflict',
        error: 'User already on leave',
      });
    }

    user.leave = true;
    await user.save();

    await Notice.create({
      title: 'Leave of absence',
      content: `${user.fullname} is on leave`,
      user: user._id,
    });

    return res.json({
      message: 'Leave commenced',
      data: user,
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      message: 'Internal server error',
      error: err.message,
    });
  }
};

const returnFromLeave = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        message: 'Not found',
        error: 'User not found',
      });
    }

    if (!user.leave) {
      return res.status(409).json({
        message: 'Conflict',
        error: 'User not on leave',
      });
    }

    user.leave = false;
    await user.save();

    await Notice.create({
      title: 'Return from leave',
      content: `${user.fullname} has returned from leave`,
      user: user._id,
    });

    return res.json({
      message: 'Leave ended',
      data: user,
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      message: 'Internal server error',
      error: err.message,
    });
  }
};

module.exports = { createNotice, all, leaveNotice, returnFromLeave };
