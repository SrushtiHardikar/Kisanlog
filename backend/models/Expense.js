const mongoose = require('mongoose');

// Allowed expense categories
const EXPENSE_CATEGORIES = [
  'Seeds',
  'Fertilizers',
  'Pesticides',
  'Labor',
  'Machinery',
  'Fuel',
  'Irrigation',
  'Other'
];

const expenseSchema = new mongoose.Schema({
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
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: EXPENSE_CATEGORIES,
      message: '{VALUE} is not a valid category'
    }
  },
  season: {
    type: String,
    enum: {
      values: ['Kharif', 'Rabi', 'Zaid'],
      message: '{VALUE} is not a valid season'
    },
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be a positive number']
  }
}, {
  timestamps: true
});

// Index for faster queries by user and date
expenseSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Expense', expenseSchema);