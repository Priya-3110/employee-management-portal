const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');

const signToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET || 'change_this_secret',
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    }
  );

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Email and password are required.', 400);
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
    throw new AppError('Invalid email or password.', 401);
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    throw new AppError('Invalid email or password.', 401);
  }

  res.json({
    success: true,
    message: 'Login successful.',
    token: signToken(user),
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
});

module.exports = {
  login,
};
