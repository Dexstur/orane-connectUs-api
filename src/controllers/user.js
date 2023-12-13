const User = require('../models/user');
const Token = require('../models/tokens');
const sendMail = require('../utils/mail');
const bcrypt = require('bcryptjs');
const { config } = require('dotenv');
const { signupInfo, loginInfo } = require('../utils/validation');
const dev = require('../utils/log');

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
    const { email, password, fullname, adminKey } = req.body;

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
        email,
        authority: 1,
      });

      //create verification token
      const verifyToken = await Token.create({
        purpose: 'verify',
        user: newUser._id,
      });

      sendMail({
        receipient: email,
        subject: 'Connect Us: Verify your account',
        content: `Click this link to verify your account: http://localhost:3000/verify?token=${verifyToken._id.toString()}`,
      });

      dev.log(verifyToken._id.toString());

      setTimeout(async () => {
        const exp = await Token.findById(verifyToken._id);
        if (exp) {
          await Token.findByIdAndDelete(verifyToken._id);
        }
      }, 1000 * 60 * 60 * 24);

      return res.status(201).json({
        message: 'Admin created',
        data: newUser,
      });
    } else {
      //for user registration
      const tokenExists = await Token.findById(token);
      if (!tokenExists) {
        return res.status(401).json({
          message: 'Unauthorized',
          error: 'Invalid token',
        });
      }

      //hash password
      const salt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(password, salt);

      const newUser = await User.create({
        fullname,
        password: hash,
        email,
        authority: 0,
        verified: true,
      });

      //delete token
      await Token.findByIdAndDelete(token);

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

const login = async (req, res) => {
  //login goes here
};

module.exports = { signup, login };
