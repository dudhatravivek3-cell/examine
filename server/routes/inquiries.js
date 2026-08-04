const express = require('express');
const router = express.Router();
const Inquiry = require('../models/Inquiry');
const { protect } = require('../middleware/auth');
const { sendEmail } = require('../utils/mailer');

// @desc    Submit a contact inquiry
// @route   POST /api/inquiries
// @access  Public
router.post('/', async (req, res) => {
  const { name, company, country, email, phone, productInterest, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Name, Email, and Message are required' 
    });
  }

  try {
    const inquiry = new Inquiry({
      name,
      company,
      country,
      email,
      phone,
      productInterest,
      message
    });

    const savedInquiry = await inquiry.save();

    // Send email notification to Admin
    const emailReceiver = process.env.EMAIL_RECEIVER || 'admin@example.com';
    const emailSubject = `New Contact Inquiry from ${name} (${country || 'Unknown Country'})`;
    const emailHtml = `
      <h3>New Contact Inquiry Received</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Company:</strong> ${company || 'N/A'}</p>
      <p><strong>Country:</strong> ${country || 'N/A'}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
      <p><strong>Product Interest:</strong> ${productInterest || 'General Inquiry'}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    await sendEmail({
      to: emailReceiver,
      subject: emailSubject,
      html: emailHtml
    });

    return res.status(201).json({
      status: 'success',
      message: 'Inquiry submitted successfully',
      data: savedInquiry
    });
  } catch (error) {
    console.error('Inquiry submission error:', error.message);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Server error, failed to submit inquiry' 
    });
  }
});

// @desc    Get inquiries submitted by logged in user
// @route   GET /api/inquiries/my-inquiries
// @access  Private
router.get('/my-inquiries', protect, async (req, res) => {
  try {
    const userEmail = req.user?.email;
    if (!userEmail) {
      return res.status(400).json({ status: 'error', message: 'User email not found' });
    }
    const inquiries = await Inquiry.find({ email: userEmail.toLowerCase() }).sort({ createdAt: -1 });
    return res.json({ status: 'success', data: inquiries });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
});

// @desc    Get all contact inquiries
// @route   GET /api/inquiries
// @access  Private (Admin only)
router.get('/', protect, async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    return res.json({
      status: 'success',
      data: inquiries
    });
  } catch (error) {
    console.error('Fetch inquiries error:', error.message);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Server error' 
    });
  }
});

// @desc    Update inquiry status
// @route   PUT /api/inquiries/:id
// @access  Private (Admin only)
router.put('/:id', protect, async (req, res) => {
  const { status } = req.body;

  if (!status || !['new', 'read', 'replied', 'in-progress', 'completed', 'archived'].includes(status)) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Please provide a valid status' 
    });
  }

  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Inquiry not found' 
      });
    }

    inquiry.status = status;
    const updatedInquiry = await inquiry.save();

    return res.json({
      status: 'success',
      message: 'Inquiry status updated',
      data: updatedInquiry
    });
  } catch (error) {
    console.error('Update inquiry status error:', error.message);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Server error' 
    });
  }
});

// @desc    Delete inquiry
// @route   DELETE /api/inquiries/:id
// @access  Private (Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const inquiry = await Inquiry.findById(req.params.id);

    if (!inquiry) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Inquiry not found' 
      });
    }

    await inquiry.deleteOne();

    return res.json({
      status: 'success',
      message: 'Inquiry deleted successfully'
    });
  } catch (error) {
    console.error('Delete inquiry error:', error.message);
    return res.status(500).json({ 
      status: 'error', 
      message: 'Server error' 
    });
  }
});

module.exports = router;
