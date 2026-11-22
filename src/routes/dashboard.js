const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/dashboard/stats - environmental impact metrics, charts data & user progress
router.get('/stats', (req, res) => {
  try {
    const stats = db.getStats();
    const data = db.read();

    // Generate recent activity stream
    const activities = [];

    // Add recent pickups
    data.pickups.forEach(p => {
      activities.push({
        type: 'pickup',
        title: `Pickup ${p.status}: ${p.materialSummary}`,
        category: p.category,
        date: p.pickupDate || p.createdAt,
        timestamp: new Date(p.createdAt).getTime(),
        points: p.status === 'Completed' ? `+${p.pointsAwarded} pts` : `${p.pointsAwarded} pts (pending)`,
        status: p.status
      });
    });

    // Add recent listings
    data.listings.forEach(l => {
      activities.push({
        type: 'listing',
        title: `Material Listed: ${l.title}`,
        category: l.category,
        date: l.createdAt.split('T')[0],
        timestamp: new Date(l.createdAt).getTime(),
        points: `+${l.estimatedPoints} potential pts`,
        status: l.status
      });
    });

    // Add recent redemptions
    data.redemptions.forEach(r => {
      activities.push({
        type: 'redemption',
        title: `Reward Redeemed: ${r.rewardTitle}`,
        category: 'Reward',
        date: r.redeemedAt.split('T')[0],
        timestamp: new Date(r.redeemedAt).getTime(),
        points: `-${r.pointsSpent} pts`,
        status: r.voucherCode
      });
    });

    // Sort by most recent
    activities.sort((a, b) => b.timestamp - a.timestamp);

    // Monthly trends (mocked realistic aggregated timeline)
    const monthlyTrends = {
      labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
      wasteKg: [12.0, 18.5, 24.0, 31.2, 42.0, stats.totalWeightRecycled],
      pointsEarned: [180, 290, 380, 520, 680, stats.user.lifetimePoints]
    };

    res.json({
      success: true,
      stats: {
        ...stats,
        recentActivities: activities.slice(0, 10),
        monthlyTrends
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
