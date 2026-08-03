const mongoose = require('mongoose');

const statisticSchema = new mongoose.Schema({
  countriesServed: {
    type: Number,
    default: 30
  },
  shipments: {
    type: Number,
    default: 5000
  },
  yearsExperience: {
    type: Number,
    default: 10
  },
  happyClients: {
    type: Number,
    default: 1000
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Statistic', statisticSchema);
