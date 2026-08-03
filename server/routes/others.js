const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// Models
const Gallery = require('../models/Gallery');
const Testimonial = require('../models/Testimonial');
const Faq = require('../models/Faq');
const Certification = require('../models/Certification');
const Country = require('../models/Country');
const Statistic = require('../models/Statistic');

// ==========================================
// GALLERY ROUTES
// ==========================================
router.get('/gallery', async (req, res) => {
  const { category } = req.query;
  const filter = {};
  if (category) {
    filter.category = category;
  }
  try {
    const items = await Gallery.find(filter).sort({ createdAt: -1 });
    return res.json({ status: 'success', data: items });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/gallery', protect, async (req, res) => {
  const { title, category, imageUrl } = req.body;
  if (!category || !imageUrl) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Category and Image URL are required' 
    });
  }
  try {
    const item = new Gallery({ title, category, imageUrl });
    const saved = await item.save();
    return res.status(201).json({ status: 'success', data: saved });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

router.delete('/gallery/:id', protect, async (req, res) => {
  try {
    const item = await Gallery.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ status: 'error', message: 'Gallery item not found' });
    }
    await item.deleteOne();
    return res.json({ status: 'success', message: 'Gallery item deleted successfully' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// ==========================================
// TESTIMONIALS ROUTES
// ==========================================
router.get('/testimonials', async (req, res) => {
  try {
    const list = await Testimonial.find().sort({ createdAt: -1 });
    return res.json({ status: 'success', data: list });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/testimonials', protect, async (req, res) => {
  const { customerName, country, review, companyName } = req.body;
  if (!customerName || !review) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Customer Name and Review are required' 
    });
  }
  try {
    const item = new Testimonial({ customerName, country, review, companyName });
    const saved = await item.save();
    return res.status(201).json({ status: 'success', data: saved });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

router.put('/testimonials/:id', protect, async (req, res) => {
  const { customerName, country, review, companyName } = req.body;
  try {
    const item = await Testimonial.findById(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Testimonial not found' });

    if (customerName) item.customerName = customerName;
    if (country !== undefined) item.country = country;
    if (review) item.review = review;
    if (companyName !== undefined) item.companyName = companyName;

    const saved = await item.save();
    return res.json({ status: 'success', data: saved });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

router.delete('/testimonials/:id', protect, async (req, res) => {
  try {
    const item = await Testimonial.findById(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Testimonial not found' });
    await item.deleteOne();
    return res.json({ status: 'success', message: 'Testimonial deleted successfully' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// ==========================================
// FAQ ROUTES
// ==========================================
router.get('/faqs', async (req, res) => {
  try {
    const list = await Faq.find().sort({ createdAt: -1 });
    return res.json({ status: 'success', data: list });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/faqs', protect, async (req, res) => {
  const { question, answer } = req.body;
  if (!question || !answer) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Question and Answer are required' 
    });
  }
  try {
    const item = new Faq({ question, answer });
    const saved = await item.save();
    return res.status(201).json({ status: 'success', data: saved });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

router.put('/faqs/:id', protect, async (req, res) => {
  const { question, answer } = req.body;
  try {
    const item = await Faq.findById(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'FAQ not found' });

    if (question) item.question = question;
    if (answer) item.answer = answer;

    const saved = await item.save();
    return res.json({ status: 'success', data: saved });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

router.delete('/faqs/:id', protect, async (req, res) => {
  try {
    const item = await Faq.findById(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'FAQ not found' });
    await item.deleteOne();
    return res.json({ status: 'success', message: 'FAQ deleted successfully' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// ==========================================
// CERTIFICATION ROUTES
// ==========================================
router.get('/certifications', async (req, res) => {
  try {
    const list = await Certification.find().sort({ name: 1 });
    return res.json({ status: 'success', data: list });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/certifications', protect, async (req, res) => {
  const { name, imageUrl, issueDate, downloadUrl } = req.body;
  if (!name || !imageUrl) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Name and Image URL are required' 
    });
  }
  try {
    const item = new Certification({ name, imageUrl, issueDate, downloadUrl });
    const saved = await item.save();
    return res.status(201).json({ status: 'success', data: saved });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

router.put('/certifications/:id', protect, async (req, res) => {
  const { name, imageUrl, issueDate, downloadUrl } = req.body;
  try {
    const item = await Certification.findById(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Certification not found' });

    if (name) item.name = name;
    if (imageUrl) item.imageUrl = imageUrl;
    if (issueDate !== undefined) item.issueDate = issueDate;
    if (downloadUrl !== undefined) item.downloadUrl = downloadUrl;

    const saved = await item.save();
    return res.json({ status: 'success', data: saved });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

router.delete('/certifications/:id', protect, async (req, res) => {
  try {
    const item = await Certification.findById(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Certification not found' });
    await item.deleteOne();
    return res.json({ status: 'success', message: 'Certification deleted successfully' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// ==========================================
// COUNTRY ROUTES
// ==========================================
router.get('/countries', async (req, res) => {
  try {
    const list = await Country.find().sort({ countryName: 1 });
    return res.json({ status: 'success', data: list });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

router.post('/countries', protect, async (req, res) => {
  const { countryName, code, exportDetails } = req.body;
  if (!countryName || !code) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Country Name and ISO Code are required' 
    });
  }
  try {
    const item = new Country({ countryName, code, exportDetails });
    const saved = await item.save();
    return res.status(201).json({ status: 'success', data: saved });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

router.put('/countries/:id', protect, async (req, res) => {
  const { countryName, code, exportDetails } = req.body;
  try {
    const item = await Country.findById(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Country not found' });

    if (countryName) item.countryName = countryName;
    if (code) item.code = code;
    if (exportDetails !== undefined) item.exportDetails = exportDetails;

    const saved = await item.save();
    return res.json({ status: 'success', data: saved });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

router.delete('/countries/:id', protect, async (req, res) => {
  try {
    const item = await Country.findById(req.params.id);
    if (!item) return res.status(404).json({ status: 'error', message: 'Country not found' });
    await item.deleteOne();
    return res.json({ status: 'success', message: 'Country deleted successfully' });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// ==========================================
// STATISTICS ROUTES
// ==========================================
router.get('/statistics', async (req, res) => {
  try {
    let stat = await Statistic.findOne();
    if (!stat) {
      stat = new Statistic();
    }
    return res.json({ status: 'success', data: stat });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

router.put('/statistics', protect, async (req, res) => {
  const { countriesServed, shipments, yearsExperience, happyClients } = req.body;
  try {
    let stat = await Statistic.findOne();
    if (!stat) {
      stat = new Statistic();
    }

    if (countriesServed !== undefined) stat.countriesServed = countriesServed;
    if (shipments !== undefined) stat.shipments = shipments;
    if (yearsExperience !== undefined) stat.yearsExperience = yearsExperience;
    if (happyClients !== undefined) stat.happyClients = happyClients;
    stat.updatedAt = Date.now();

    const saved = await stat.save();
    return res.json({ status: 'success', data: saved });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
