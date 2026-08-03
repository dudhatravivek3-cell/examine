const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
  countryName: {
    type: String,
    required: [true, 'Country name is required'],
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Country code is required'],
    trim: true,
    uppercase: true
  },
  exportDetails: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Country', countrySchema);
