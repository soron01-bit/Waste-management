const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/pickups - get all scheduled and past pickups
router.get('/', (req, res) => {
  try {
    const pickups = db.getPickups();
    res.json({ success: true, count: pickups.length, data: pickups });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/pickups - schedule a new waste pickup
router.post('/', (req, res) => {
  try {
    const {
      listingId,
      materialSummary,
      category,
      weightEstKg,
      pickupDate,
      timeSlot,
      pickupAddress,
      contactName,
      contactPhone,
      centerAssigned,
      notes
    } = req.body;

    if (!pickupDate || !pickupAddress) {
      return res.status(400).json({
        success: false,
        error: 'Pickup date and address are required.'
      });
    }

    const newPickup = db.createPickup({
      listingId,
      materialSummary,
      category: category || 'Plastic',
      weightEstKg: parseFloat(weightEstKg) || 5,
      pickupDate,
      timeSlot: timeSlot || '09:00 AM - 12:00 PM',
      pickupAddress,
      contactName,
      contactPhone,
      centerAssigned: centerAssigned || 'GreenCycle Regional Hub',
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Pickup scheduled successfully! A driver will be assigned.',
      data: newPickup
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH /api/pickups/:id/status - update pickup status (e.g. Scheduled -> Completed)
router.patch('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }

    const validStatuses = ['Scheduled', 'Driver En Route', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const updated = db.updatePickupStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Pickup not found' });
    }

    res.json({
      success: true,
      message: `Pickup status updated to ${status}. ${status === 'Completed' ? 'Reward points credited!' : ''}`,
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
