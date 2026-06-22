const jwt = require('jsonwebtoken');
const { User } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    throw new AppError('Authentication token is required.', 401);
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET || 'change_this_secret');
  const user = await User.findByPk(decoded.id, {
    attributes: ['id', 'email', 'role', 'created_at'],
  });

  if (!user) {
    throw new AppError('The user for this token no longer exists.', 401);
  }

  req.user = user;
  next();
});

module.exports = {
  protect,
};
