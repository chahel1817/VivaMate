const express = require('express');
const cors = require('cors');
const forumRoutes = require('../server/routes/forum');
const feedbackRoutes = require('../server/routes/feedback');
const dashboardRoutes = require('../server/routes/dashboard'); // Include the dashboard route

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/forum', forumRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/dashboard', dashboardRoutes); // Add the dashboard route here

module.exports = app;
