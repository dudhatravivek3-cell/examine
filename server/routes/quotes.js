const express = require('express');
const router = express.Router();
const Quote = require('../models/Quote');
const { protect } = require('../middleware/auth');
const { sendEmail } = require('../utils/mailer');

// @desc    Submit a quote request
// @route   POST /api/quotes
// @access  Public
router.post('/', async (req, res) => {
  const { name, companyName, country, email, phone, productName, quantity, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Name, Email, and Message/Requirements are required' 
    });
  }

  try {
    const quote = new Quote({
      name,
      companyName,
      country,
      email,
      phone,
      productName,
      quantity,
      message
    });

    const savedQuote = await quote.save();

    // Send email notification to Admin
    const emailReceiver = process.env.EMAIL_RECEIVER || 'admin@example.com';
    const emailSubject = `New Price Quote Request for ${productName || 'General Product'} from ${name}`;
    const emailHtml = `
      <h3>New Quote Request Received</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Company:</strong> ${companyName || 'N/A'}</p>
      <p><strong>Country:</strong> ${country || 'N/A'}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
      <p><strong>Product Name:</strong> ${productName || 'General'}</p>
      <p><strong>Quantity Needed:</strong> ${quantity || 'N/A'}</p>
      <p><strong>Requirements/Message:</strong></p>
      <p>${message}</p>
    `;

    await sendEmail({
      to: emailReceiver,
      subject: emailSubject,
      html: emailHtml
    });

    return res.status(201).json({
      status: 'success',
      message: 'Quote request submitted successfully',
      data: savedQuote
    });
  } catch (error) {
    console.error('Quote submission error:', error.message);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Server error, failed to submit quote request' 
    });
  }
});

// @desc    Get quotes submitted by logged in user
// @route   GET /api/quotes/my-quotes
// @access  Private
router.get('/my-quotes', protect, async (req, res) => {
  try {
    const userEmail = req.user?.email;
    if (!userEmail) {
      return res.status(400).json({ status: 'error', message: 'User email not found' });
    }
    const quotes = await Quote.find({ email: userEmail.toLowerCase() }).sort({ createdAt: -1 });
    return res.json({ status: 'success', data: quotes });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Get all quote requests
// @route   GET /api/quotes
// @access  Private (Admin only)
router.get('/', protect, async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });
    return res.json({
      status: 'success',
      data: quotes
    });
  } catch (error) {
    console.error('Fetch quotes error:', error.message);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Server error' 
    });
  }
});

// @desc    Update quote status
// @route   PUT /api/quotes/:id
// @access  Private (Admin only)
router.put('/:id', protect, async (req, res) => {
  const { status } = req.body;

  if (!status || !['new', 'pending', 'processed', 'in-progress', 'completed', 'archived'].includes(status)) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Please provide a valid status' 
    });
  }

  try {
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Quote request not found' 
      });
    }

    quote.status = status;
    const updatedQuote = await quote.save();

    return res.json({
      status: 'success',
      message: 'Quote status updated',
      data: updatedQuote
    });
  } catch (error) {
    console.error('Update quote status error:', error.message);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Server error' 
    });
  }
});

// @desc    Delete quote request
// @route   DELETE /api/quotes/:id
// @access  Private (Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Quote request not found' 
      });
    }

    await quote.deleteOne();

    return res.json({
      status: 'success',
      message: 'Quote request deleted successfully'
    });
  } catch (error) {
    console.error('Delete quote error:', error.message);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Server error' 
    });
  }
});

module.exports = router;
