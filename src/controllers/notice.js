const User = require('../models/user');
const Notice = require('../models/notice');
const dev = require('../utils/log');

const createNotice = async (req, res) => {
  try {
    const { title, content } = req.body;

    // Check if the user is an admin
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user || user.authority < 1) {
      return res.status(403).json({
        message: 'Forbidden',
        error: 'Admin only',
      });
    }

    // Check if title or content is empty
    if (!title || title.trim() === '' || !content || content.trim() === '') {
      return res.status(400).json({
        message: 'Bad request',
        error: 'Title and/or content  cannot be empty',
      });
    }

    // Create notice
    const notice = await Notice.create({
      title,
      content,
      system: false,
      user: userId,
    });

    return res.status(201).json({
      message: 'Notice created',
      data: notice,
    });
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
      data: data.reverse(),
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

//function to update notice

const updateNotice = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    // Check if the user is an admin
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user || user.authority < 1) {
      return res.status(403).json({
        message: 'Forbidden',
        error: 'Admin only',
      });
    }

    // Check if title or content is empty
    if (!title || title.trim() === '' || !content || content.trim() === '') {
      return res.status(400).json({
        message: 'Bad request',
        error: 'Title and/or content cannot be empty',
      });
    }

    // Find and update the notice
    const notice = await Notice.findById(id);

    if (!notice) {
      return res.status(404).json({
        message: 'Not found',
        error: 'Notice not found',
      });
    }

    if (notice.system) {
      return res.status(403).json({
        message: 'Forbidden',
        error: 'Cannot update system notice',
      });
    }

    const updatedNotice = await Notice.findByIdAndUpdate(
      id,
      { title, content },
      { new: true },
    );

    return res.status(200).json({
      message: 'Notice updated',
      data: updatedNotice,
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      message: 'Internal server error',
      error: err.message,
    });
  }
};

const viewOne = async (req, res) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findById(id)
      .populate({
        path: 'responses',
        populate: {
          path: 'user',
          model: 'User',
          select: 'fullname',
        },
      })
      .exec();

    if (!notice) {
      return res.status(404).json({
        message: 'Not found',
        error: 'Notice not found',
      });
    }

    return res.status(200).json({
      message: 'Notice found',
      data: notice,
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      message: 'Internal server error',
      error: err.message,
    });
  }
};

async function runCommand() {
  const notices = await Notice.find({});

  notices.forEach(async (notice) => {
    notice.system = true;
    await notice.save();
    console.log('modified');
  });
}

// runCommand();
module.exports = {
  createNotice,
  all,
  leaveNotice,
  returnFromLeave,
  updateNotice,
  viewOne,
};
