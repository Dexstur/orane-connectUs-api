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

const generateKey = (email) => {
  const token = jwt.sign({ email }, secretKey, { expiresIn: '24h' });
  const encoded = Buffer.from(token).toString('base64');
  return encoded;
};

const verifyKey = (token) => {
  try {
    const decrypt = Buffer.from(token, 'base64').toString();
    const decoded = jwt.verify(decrypt, secretKey);
    return decoded.email;
  } catch {
    return null;
  }
};

module.exports = { generateToken, verifyToken, generateKey, verifyKey };
