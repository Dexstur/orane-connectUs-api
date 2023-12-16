const User = require('../models/user');
const Token = require('../models/tokens');
const Notice = require('../models/notice');
const sendMail = require('../utils/mail');
const bcrypt = require('bcryptjs');
const { config } = require('dotenv');
const { signupInfo, loginInfo } = require('../utils/validation');
const dev = require('../utils/log');
const { generateToken, generateKey, verifyKey } = require('../utils/jwt');

config();

const adminSecret = process.env.ADMIN_KEY || '';
const saltRounds = Number(process.env.SALT_ROUNDS) || 2;

const signup = async (req, res) => {
  try {
    //validate request body
    const { error } = signupInfo.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.message,
        error: 'Bad request',
      });
    }
    const { email, password, fullname, gender, adminKey } = req.body;

    //check if user exists
    const existingUser = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'User already exists. Login instead',
        error: 'Bad request',
      });
    }

    //get token from query
    const { token } = req.query;

    //check signup options
    if (!token && !adminKey) {
      return res.status(401).json({
        message: 'Unauthorized',
        error: 'No token or admin key provided',
      });
    }

    //for admin registration
    if (adminKey) {
      if (adminKey !== adminSecret) {
        return res.status(401).json({
          message: 'Unauthorized',
          error: 'Invalid admin key',
        });
      }

      //hash password
      const salt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(password, salt);

      const newUser = await User.create({
        fullname,
        password: hash,
        email: email.toLowerCase().trim(),
        gender,
        authority: 1,
      });

      //create verification token
      const verifyToken = generateKey(email.toLowerCase().trim());

      sendMail({
        receipient: email,
        subject: 'Connect Us: Verify your account',
        content: `Click this link to verify your account: http://localhost:3000/verify?token=${verifyToken}`,
      });

      dev.log(verifyToken);

      return res.status(201).json({
        message: 'Admin created',
        data: newUser,
      });
    } else {
      //for user registration
      const storedMail = verifyKey(token);
      if (!storedMail) {
        return res.status(401).json({
          message: 'Unauthorized',
          error: 'Invalid token',
        });
      }

      if (storedMail !== email) {
        return res.status(409).json({
          message: 'Unauthorized',
          error: 'Invalid token for email',
        });
      }

      //hash password
      const salt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(password, salt);

      const newUser = await User.create({
        fullname,
        password: hash,
        email: storedMail,
        gender,
        authority: 0,
        verified: true,
      });

      await Notice.create({
        title: 'New staff member',
        content: `${fullname}, has joined the team`,
        user: newUser._id,
      });

      return res.status(201).json({
        message: 'User created',
        data: newUser,
      });
    }
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      message: 'Internal server error',
      error: err.message,
    });
  }
};

//login functionality
const login = async (req, res) => {
  try {
    // Validate request body
    const { error } = loginInfo.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.message,
        error: 'Bad request',
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(404).json({
        message: 'Unauthorized',
        error: 'Invalid credentials',
      });
    }

    // Check if user is verified
    if (!user.verified) {
      return res.status(409).json({
        message: 'Unauthorized',
        error: 'User not verified',
      });
    }

    // Check password
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        message: 'Unauthorized',
        error: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken(user);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
    });

    // Set header and send response
    return res.header('Authorization', `Bearer ${token}`).status(200).json({
      message: 'Login successful',
      data: user,
      token,
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      message: 'Internal server error',
      error: err.message,
    });
  }
};

const allStaff = async (req, res) => {
  try {
    const { page = 1, s = '' } = req.query;
    const limit = 20;

    const data = await User.find({
      $or: [
        { fullname: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
      ],
    })
      .limit(limit * 1)
      .skip((Number(page) - 1) * limit)
      .exec();

    const count = await User.countDocuments({
      $or: [
        { fullname: { $regex: s, $options: 'i' } },
        { email: { $regex: s, $options: 'i' } },
      ],
    });

    const pages = Math.ceil(count / limit);
    return res.status(200).json({
      message: 'All staff',
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

const regularStaff = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const limit = 20;

    const data = await User.find({ authority: 0 })
      .limit(limit * 1)
      .skip((Number(page) - 1) * limit)
      .exec();

    const count = await User.countDocuments({ authority: 0 });
    const pages = Math.ceil(count / limit);
    return res.status(200).json({
      message: 'All staff',
      data,
      count,
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

const adminStaff = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const limit = 20;

    const data = await User.find({ authority: 1 })
      .limit(limit * 1)
      .skip((Number(page) - 1) * limit)
      .exec();

    const count = await User.countDocuments({ authority: 1 });
    const pages = Math.ceil(count / limit);
    return res.status(200).json({
      message: 'All staff',
      data,
      count,
      pages,
      page,
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      message: 'Internal server error',
      error: err.message,
    });
  }
};

const onLeave = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const limit = 20;

    const data = await User.find({ leave: true })
      .limit(limit * 1)
      .skip((Number(page) - 1) * limit)
      .exec();

    const count = await User.countDocuments({ leave: true });
    const pages = Math.ceil(count / limit);

    return res.status(200).json({
      message: 'Users on leave',
      data,
      page,
      pages,
      count,
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      message: 'Internal server error',
      error: err.message,
    });
  }
};

//run general commands when needed
function runCommand() {
  User.find({}).then((users) => {
    users.forEach(async (user) => {
      user.gender = 'M';
      await user.save();
      console.log('modified');
    });
  });
}

module.exports = { signup, login, allStaff, regularStaff, adminStaff, onLeave };
