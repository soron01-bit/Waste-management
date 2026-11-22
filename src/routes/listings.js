const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../db');

// Setup multer storage for material image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'waste-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// GET /api/listings
router.get('/', (req, res) => {
  try {
    const { category, status, search } = req.query;
    const listings = db.getListings(category, status, search);
    res.json({ success: true, count: listings.length, data: listings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/listings/:id
router.get('/:id', (req, res) => {
  try {
    const listing = db.getListingById(req.params.id);
    if (!listing) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }
    res.json({ success: true, data: listing });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/listings - create new listing with optional image upload
router.post('/', upload.single('image'), (req, res) => {
  try {
    const {
      title,
      category,
      weightKg,
      quantityDesc,
      condition,
      location,
      contactName,
      contactPhone,
      description
    } = req.body;

    if (!title || !category || !weightKg) {
      return res.status(400).json({
        success: false,
        error: 'Title, category, and weight are required.'
      });
    }

    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    } else if (req.body.imageUrl) {
      imageUrl = req.body.imageUrl;
    } else {
      // Default thematic fallback image based on category
      const fallbacks = {
        Plastic: 'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=600&auto=format&fit=crop&q=80',
        Paper: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
        Metal: 'https://images.unsplash.com/photo-1567095761054-7a02e69e5c43?w=600&auto=format&fit=crop&q=80',
        Electronics: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80'
      };
      imageUrl = fallbacks[category] || 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80';
    }

    const newListing = db.createListing({
      title,
      category,
      weightKg: parseFloat(weightKg),
      quantityDesc,
      condition,
      location,
      contactName,
      contactPhone,
      description,
      imageUrl
    });

    res.status(201).json({
      success: true,
      message: 'Recyclable material listing created successfully!',
      data: newListing
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/listings/:id/claim - claim listing for reuse
router.post('/:id/claim', (req, res) => {
  try {
    const { claimantName } = req.body;
    const updated = db.claimListing(req.params.id, claimantName || 'Community Recycler / Organization');
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }
    res.json({
      success: true,
      message: 'Material claimed successfully for reuse!',
      data: updated
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/listings/:id
router.delete('/:id', (req, res) => {
  try {
    const deleted = db.deleteListing(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Listing not found' });
    }
    res.json({ success: true, message: 'Listing removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
