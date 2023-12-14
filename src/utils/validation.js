const Joi = require('joi');

const signupInfo = Joi.object({
  fullname: Joi.string().required().min(3).max(60),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6).max(30),
  gender: Joi.string().valid('M', 'F').required(),
  adminKey: Joi.string().optional(),
});

const loginInfo = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6).max(30),
});

module.exports = { signupInfo, loginInfo };
