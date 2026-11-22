const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const listingsRouter = require('./src/routes/listings');
const centersRouter = require('./src/routes/centers');
const pickupsRouter = require('./src/routes/pickups');
const rewardsRouter = require('./src/routes/rewards');
const dashboardRouter = require('./src/routes/dashboard');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'src', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// Serve user uploaded images
app.use('/uploads', express.static(uploadDir));

// API Routes
app.use('/api/listings', listingsRouter);
app.use('/api/centers', centersRouter);
app.use('/api/pickups', pickupsRouter);
app.use('/api/rewards', rewardsRouter);
app.use('/api/dashboard', dashboardRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    appName: 'Smart Waste Exchange API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Fallback to index.html for SPA client-side routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🌱 Smart Waste Exchange platform running!`);
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
  console.log(`📦 Recyclable materials exchange active.`);
  console.log(`====================================================`);
});

module.exports = app;
