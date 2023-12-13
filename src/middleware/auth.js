const { validateToken } = require('../utils/jwt');

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;

  if (!token) {
    return res.status(401).json({
      message: 'Unauthorized',
      error: 'No token provided',
    });
  }
  const decoded = validateToken(token);

  if (!decoded) {
    return res.status(401).json({
      message: 'Unauthorized',
      error: 'Invalid token',
    });
  }

  req.user = decoded;
  next();
};

const adminAuth = (req, res, next) => {
  if (req.user.authority === 0) {
    return res.status(401).json({
      message: 'Unauthorized',
      error: 'Admin only',
    });
  }
  next();
};

module.exports = { auth, adminAuth };
