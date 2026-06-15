const mongoose = require('mongoose');

const yieldSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  crop: {
    type: String,
    required: [true, 'Crop name is required'],
    trim: true
  },
  season: {
    type: String,
    enum: {
      values: ['Kharif', 'Rabi', 'Zaid'],
      message: '{VALUE} is not a valid season'
    },
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity must be a positive number']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    trim: true
  },
  pricePerUnit: {
    type: Number,
    required: [true, 'Price per unit is required'],
    min: [0, 'Price per unit must be a positive number']
  },
  totalRevenue: {
    type: Number,
    required: true,
    min: [0, 'Total revenue must be a positive number']
  }
}, {
  timestamps: true
});

// Index for faster queries by user and date
yieldSchema.index({ user: 1, date: -1 });

// Pre-save hook to auto-calculate totalRevenue
yieldSchema.pre('save', function () {
  this.totalRevenue = this.quantity * this.pricePerUnit;
});

module.exports = mongoose.model('Yield', yieldSchema);