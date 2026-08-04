const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// Slugify helper
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    return res.json({ status: 'success', data: categories });
  } catch (error) {
    console.error('Fetch categories error:', error.message);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// @desc    Get category by slug
// @route   GET /api/categories/:slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      return res.status(404).json({ status: 'error', message: 'Category not found' });
    }
    return res.json({ status: 'success', data: category });
  } catch (error) {
    console.error('Fetch category error:', error.message);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// @desc    Create a category
// @route   POST /api/categories
// @access  Private (Admin only)
router.post('/', protect, async (req, res) => {
  const { name, description, imageUrl, slug } = req.body;

  if (!name) {
    return res.status(400).json({ status: 'error', message: 'Category name is required' });
  }

  const categorySlug = slug || slugify(name);

  try {
    // Check if slug is unique
    const existing = await Category.findOne({ slug: categorySlug });
    if (existing) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'A category with this name or slug already exists' 
      });
    }

    const category = new Category({
      name,
      slug: categorySlug,
      description,
      imageUrl
    });

    const savedCategory = await category.save();
    return res.status(201).json({ status: 'success', data: savedCategory });
  } catch (error) {
    console.error('Create category error:', error.message);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private (Admin only)
router.put('/:id', protect, async (req, res) => {
  const { name, description, imageUrl, slug } = req.body;

  try {
    const updateData = {};

    if (name) {
      updateData.name = name;
      updateData.slug = slug || slugify(name);
    } else if (slug) {
      updateData.slug = slug;
    }

    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ status: 'error', message: 'Category not found' });
    }

    return res.json({ status: 'success', data: updatedCategory });
  } catch (error) {
    console.error('Update category error:', error.message);
    return res.status(500).json({ status: 'error', message: error.message || 'Server error' });
  }
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private (Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ status: 'error', message: 'Category not found' });
    }

    // Check if there are products belonging to this category
    const productsCount = await Product.countDocuments({ categoryId: req.params.id });
    if (productsCount > 0) {
      return res.status(400).json({ 
        status: 'error', 
        message: `Cannot delete category: ${productsCount} products belong to it. Delete those products first.` 
      });
    }

    await category.deleteOne();
    return res.json({ status: 'success', message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error.message);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

module.exports = router;
