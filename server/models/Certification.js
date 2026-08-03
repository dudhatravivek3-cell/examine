const mongoose = require('mongoose');

const certificationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Certification name is required'],
    trim: true
  },
  imageUrl: {
    type: String,
    required: [true, 'Certification logo image URL is required']
  },
  issueDate: {
    type: Date
  },
  downloadUrl: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Certification', certificationSchema);
