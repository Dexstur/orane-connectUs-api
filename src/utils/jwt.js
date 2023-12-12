const jwt = require('jsonwebtoken');
const { config } = require('dotenv');

config();

const secretKey = process.env.JWT_SECRET;

const generateToken = (user) => {
  const token = jwt.sign(
    { id: user._id.toString(), authority: user.authority },
    secretKey,
  );

  return token;
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, secretKey);
    return { id: decoded.id, authority: decoded.authority };
  } catch {
    return null;
  }
};

module.exports = { generateToken, verifyToken };
