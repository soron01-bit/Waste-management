const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/rewards - list available catalog and user redemptions
router.get('/', (req, res) => {
  try {
    const rewards = db.getRewards();
    const redemptions = db.getRedemptions();
    const user = db.getUser();

    res.json({
      success: true,
      user: {
        pointsBalance: user.pointsBalance,
        lifetimePoints: user.lifetimePoints,
        rank: user.rank
      },
      rewards,
      redemptions
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/rewards/redeem - redeem reward points for a voucher
router.post('/redeem', (req, res) => {
  try {
    const { rewardId } = req.body;
    if (!rewardId) {
      return res.status(400).json({ success: false, error: 'rewardId is required' });
    }

    const result = db.redeemReward(rewardId);
    res.json({
      success: true,
      message: 'Reward successfully redeemed!',
      data: result
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

module.exports = router;
