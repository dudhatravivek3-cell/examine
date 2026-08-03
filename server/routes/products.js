const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
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

// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  const { category, search, page = 1, limit = 12 } = req.query;
  const query = {};

  try {
    // Filter by category slug if provided
    if (category) {
      const catObj = await Category.findOne({ slug: category });
      if (catObj) {
        query.categoryId = catObj._id;
      } else {
        // Category slug doesn't exist, return empty
        return res.json({
          status: 'success',
          data: [],
          pagination: { total: 0, page: Number(page), pages: 0 }
        });
      }
    }

    // Search query
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    
    const products = await Product.find(query)
      .populate('categoryId', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return res.json({
      status: 'success',
      data: products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Fetch products error:', error.message);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// @desc    Get product by slug
// @route   GET /api/products/:slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate('categoryId', 'name slug');
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }
    return res.json({ status: 'success', data: product });
  } catch (error) {
    console.error('Fetch product error:', error.message);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private (Admin only)
router.post('/', protect, async (req, res) => {
  const {
    categoryId,
    name,
    description,
    specifications,
    packagingInfo,
    origin,
    moq,
    exportAvailability,
    images,
    slug
  } = req.body;

  if (!categoryId || !name || !description) {
    return res.status(400).json({
      status: 'error',
      message: 'Category ID, Product Name, and Description are required'
    });
  }

  const productSlug = slug || slugify(name);

  try {
    // Verify Category exists
    const categoryExists = await Category.findById(categoryId);
    if (!categoryExists) {
      return res.status(400).json({ status: 'error', message: 'Invalid Category ID' });
    }

    // Check slug unique
    const existing = await Product.findOne({ slug: productSlug });
    if (existing) {
      return res.status(400).json({
        status: 'error',
        message: 'A product with this name or slug already exists'
      });
    }

    const product = new Product({
      categoryId,
      name,
      slug: productSlug,
      description,
      specifications,
      packagingInfo,
      origin,
      moq,
      exportAvailability,
      images
    });

    const savedProduct = await product.save();
    return res.status(201).json({ status: 'success', data: savedProduct });
  } catch (error) {
    console.error('Create product error:', error.message);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Admin only)
router.put('/:id', protect, async (req, res) => {
  const {
    categoryId,
    name,
    description,
    specifications,
    packagingInfo,
    origin,
    moq,
    exportAvailability,
    images,
    slug
  } = req.body;

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }

    if (categoryId) {
      const categoryExists = await Category.findById(categoryId);
      if (!categoryExists) {
        return res.status(400).json({ status: 'error', message: 'Invalid Category ID' });
      }
      product.categoryId = categoryId;
    }

    if (name) {
      product.name = name;
      if (!slug) product.slug = slugify(name);
    }
    if (slug) product.slug = slug;
    if (description !== undefined) product.description = description;
    if (specifications !== undefined) product.specifications = specifications;
    if (packagingInfo !== undefined) product.packagingInfo = packagingInfo;
    if (origin !== undefined) product.origin = origin;
    if (moq !== undefined) product.moq = moq;
    if (exportAvailability !== undefined) product.exportAvailability = exportAvailability;
    if (images !== undefined) product.images = images;

    const updatedProduct = await product.save();
    return res.json({ status: 'success', data: updatedProduct });
  } catch (error) {
    console.error('Update product error:', error.message);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }

    await product.deleteOne();
    return res.json({ status: 'success', message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error.message);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

module.exports = router;
