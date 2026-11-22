const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/centers - list all nearby collection centers with category/search filters
router.get('/', (req, res) => {
  try {
    const { category, search } = req.query;
    const centers = db.getCenters(category, search);
    res.json({ success: true, count: centers.length, data: centers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
