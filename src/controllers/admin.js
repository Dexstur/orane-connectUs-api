const User = require('../models/user');
const Token = require('../models/tokens');
const Notice = require('../models/notice');
const sendMail = require('../utils/mail');
const bcrypt = require('bcryptjs');
const { config } = require('dotenv');
const { loginInfo } = require('../utils/validation');
const { generateToken, verifyKey, generateKey } = require('../utils/jwt');
const dev = require('../utils/log');

config();

const verifyMail = async (req, res) => {
  try {
    //find token
    const { token } = req.query;
    if (!token) {
      return res.status(401).json({
        message: 'Unauthorized',
        error: 'No token provided',
      });
    }
    const storedMail = verifyKey(token);
    if (!storedMail) {
      return res.status(401).json({
        message: 'Unauthorized',
        error: 'Invalid token',
      });
    }

    //find user
    const user = await User.findOne({ email: storedMail });

    if (!user) {
      return res.status(404).json({
        message: 'Not found',
        error: 'User not found',
      });
    }

    if (user.verified) {
      return res.status(409).json({
        message: 'Conflict',
        error: 'User already verified',
      });
    }

    //verify user
    user.verified = true;
    await user.save();

    await Notice.create({
      title: 'New staff member',
      content: `${user.fullname}, has joined the team`,
      user: user._id,
    });

    return res.status(200).json({
      message: `${user.email} verified`,
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

const resendMail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Bad request',
        error: 'Email required',
      });
    }

    //find user by email
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(404).json({
        message: 'Not found',
        error: 'User not found',
      });
    }

    if (user.verified) {
      return res.status(409).json({
        message: 'Conflict',
        error: 'User already verified',
      });
    }

    //create new token
    const verifyToken = generateKey(email.toLowerCase().trim());

    //send email
    sendMail({
      receipient: email.toLowerCase().trim(),
      subject: 'Connect Us: Verify your account',
      content: `Click this link to verify your account: http://localhost:3000/verify?token=${verifyToken}`,
    });

    dev.log(verifyToken);

    return res.status(200).json({
      message: 'Verification email sent',
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

const login = async (req, res) => {
  try {
    //validate request body
    const { error } = loginInfo.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: error.message,
        error: 'Bad request',
      });
    }

    const { email, password } = req.body;

    //find user by email
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (!user) {
      return res.status(404).json({
        message: 'Unauthorized',
        error: 'Invalid credentials',
      });
    }

    //check if user is verified
    if (!user.verified) {
      return res.status(409).json({
        message: 'Unauthorized',
        error: 'User not verified',
      });
    }

    //check if user is admin
    if (user.authority === 0) {
      return res.status(403).json({
        message: 'Forbidden',
        error: 'Admin only',
      });
    }

    //check password
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({
        message: 'Unauthorized',
        error: 'Invalid credentials',
      });
    }

    //generate token
    const token = generateToken(user);

    //set cookie
    res.cookie('token', token, {
      httpOnly: true,
    });

    //set header and send response
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

const registrationToken = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Bad request',
        error: 'Email required',
      });
    }

    //find user by email
    const user = await User.findOne({ email: email.trim().toLowerCase() });

    if (user) {
      return res.status(409).json({
        message: 'Conflict',
        error: 'User already exists',
      });
    }

    //generate token
    const token = generateKey(email.trim().toLowerCase());

    //send email
    sendMail({
      receipient: email,
      subject: 'Connect Us: Sign up',
      content: `Click this link to sign up: http://localhost:3000/sign-up?token=${token}`,
    });

    dev.log(token);

    return res.status(200).json({
      message: 'Registration email sent',
      data: token,
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).json({
      message: 'Internal server error',
      error: err.message,
    });
  }
};

module.exports = { verifyMail, resendMail, login, registrationToken };
