const app = require('./app');
const { sequelize } = require('./models');
const seedAdmin = require('./utils/seedAdmin');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await sequelize.authenticate();

    if (process.env.DB_SYNC !== 'false') {
      await sequelize.sync({
        alter: process.env.DB_SYNC_ALTER === 'true',
      });
    }

    await seedAdmin();

    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error.message);
    process.exit(1);
  }
};

startServer();
