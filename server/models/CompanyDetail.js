const mongoose = require('mongoose');

const CompanyDetailSchema = new mongoose.Schema({
  companyName: {
    type: String,
    default: 'Examine Export Services'
  },
  subtitle: {
    type: String,
    default: 'EXPORT SERVICES'
  },
  description: {
    type: String,
    default: 'Examine Export Services is a premier Indian merchant exporter specializing in the bulk export of premium agricultural produce, organic spices, fresh harvests, and logistics-grade packaging.'
  },
  address: {
    type: String,
    default: '102, Export Business Park, Near Port Road, Gujarat, India.'
  },
  ownerName: {
    type: String,
    default: 'Vivek Dudhatra'
  },
  ownerTitle: {
    type: String,
    default: 'DIRECTOR, EXAMINE EXPORTS'
  },
  ownerQuote: {
    type: String,
    default: 'Examine Export Services was founded to bring reliability to the unorganized import-export market. We build long-term associations, not just one-off transactions.'
  },
  phone: {
    type: String,
    default: '+91 99999 99999'
  },
  whatsapp: {
    type: String,
    default: '+91 99999 99999'
  },
  email: {
    type: String,
    default: 'info@examineexport.com'
  },
  workingHours: {
    type: String,
    default: 'Mon - Sat, 9:00 AM - 6:00 PM (IST)'
  },
  googleMapEmbedUrl: {
    type: String,
    default: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3684.1105953049103!2d72.13625471500735!3d22.5749298851817!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395e4e811c7504a7%3A0xc3911c47ea4ab3ff!2sGujarat%2C%20India!5e0!3m2!1sen!2sus!4v1657800000000!5m2!1sen!2sus'
  },
  supportedLanguages: [
    {
      code: { type: String, required: true },
      name: { type: String, required: true },
      badge: { type: String, required: true }
    }
  ],
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CompanyDetail', CompanyDetailSchema);
