const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['Products', 'Packaging', 'Production', 'Logistics', 'Team'],
    required: [true, 'Gallery category is required']
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Gallery', gallerySchema);
