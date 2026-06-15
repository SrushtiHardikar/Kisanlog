const express = require('express');
const Yield = require('../models/Yield');
const { protect } = require('../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/yields
 * @desc    Get all yields for logged in user
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const yields = await Yield.find({ user: req.user._id })
      .sort({ date: -1 }); // Most recent first

    res.status(200).json({
      success: true,
      count: yields.length,
      data: yields
    });
  } catch (error) {
    console.error('Get yields error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching yields'
    });
  }
});

/**
 * @route   POST /api/yields
 * @desc    Create a new yield record
 * @access  Private
 */
router.post('/', protect, async (req, res) => {
  const { date, crop, quantity, unit, season, pricePerUnit } = req.body;

  try {
    // Validate required fields
    if (!date || !crop || !quantity || !unit || !pricePerUnit) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: date, crop, quantity, unit, pricePerUnit'
      });
    }

    // Validate positive numbers
    if (quantity <= 0 || pricePerUnit <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity and price per unit must be greater than zero'
      });
    }

    // Create yield (totalRevenue will be calculated by pre-save hook)
    const yieldRecord = await Yield.create({
      user: req.user._id,
      date,
      crop,
      quantity,
      unit,
      season,
      pricePerUnit,
      totalRevenue: quantity * pricePerUnit // Will also be set by hook
    });

    res.status(201).json({
      success: true,
      data: yieldRecord
    });
  } catch (error) {
    console.error('Create yield error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating yield record'
    });
  }
});

/**
 * @route   PUT /api/yields/:id
 * @desc    Update a yield record
 * @access  Private
 */
router.put('/:id', protect, async (req, res) => {
  try {
    let yieldRecord = await Yield.findById(req.params.id);

    // Check if yield exists
    if (!yieldRecord) {
      return res.status(404).json({
        success: false,
        message: 'Yield record not found'
      });
    }

    // Verify ownership
    if (yieldRecord.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this yield record'
      });
    }

    // Validate positive numbers if provided
    if (req.body.quantity !== undefined && req.body.quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than zero'
      });
    }
    if (req.body.pricePerUnit !== undefined && req.body.pricePerUnit <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Price per unit must be greater than zero'
      });
    }

    // Update fields
    Object.assign(yieldRecord, req.body);

    // Recalculate totalRevenue
    yieldRecord.totalRevenue = yieldRecord.quantity * yieldRecord.pricePerUnit;

    // Save (will also trigger pre-save hook)
    await yieldRecord.save();

    res.status(200).json({
      success: true,
      data: yieldRecord
    });
  } catch (error) {
    console.error('Update yield error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating yield record'
    });
  }
});

/**
 * @route   DELETE /api/yields/:id
 * @desc    Delete a yield record
 * @access  Private
 */
router.delete('/:id', protect, async (req, res) => {
  try {
    const yieldRecord = await Yield.findById(req.params.id);

    // Check if yield exists
    if (!yieldRecord) {
      return res.status(404).json({
        success: false,
        message: 'Yield record not found'
      });
    }

    // Verify ownership
    if (yieldRecord.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this yield record'
      });
    }

    // Delete yield
    await yieldRecord.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Yield record deleted successfully'
    });
  } catch (error) {
    console.error('Delete yield error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting yield record'
    });
  }
});

module.exports = router;