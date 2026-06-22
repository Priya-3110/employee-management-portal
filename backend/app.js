const cors = require('cors');
const express = require('express');
const path = require('path');
require('dotenv').config();

const assignmentRoutes = require('./routes/assignmentRoutes');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const projectRoutes = require('./routes/projectRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const { protect } = require('./middleware/authMiddleware');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Employee & Project Management API is running.',
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', protect, dashboardRoutes);
app.use('/api/employees', protect, employeeRoutes);
app.use('/api/projects', protect, projectRoutes);
app.use('/api/assignments', protect, assignmentRoutes);
app.use('/api/recommendations', protect, recommendationRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
