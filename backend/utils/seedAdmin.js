const bcrypt = require('bcryptjs');
const { User } = require('../models');

const seedAdmin = async () => {
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const password = process.env.ADMIN_PASSWORD || 'admin123';
  const hashedPassword = await bcrypt.hash(password, 10);

  const [admin, created] = await User.findOrCreate({
    where: { email },
    defaults: {
      email,
      password: hashedPassword,
      role: 'admin',
    },
  });

  if (!created && process.env.RESET_ADMIN_PASSWORD === 'true') {
    admin.password = hashedPassword;
    admin.role = 'admin';
    await admin.save();
  }
};

module.exports = seedAdmin;
