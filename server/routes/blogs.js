const express = require('express');
const router = express.Router();
const Blog = require('../models/Blog');
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

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    return res.json({ status: 'success', data: blogs });
  } catch (error) {
    console.error('Fetch blogs error:', error.message);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// @desc    Get blog by slug
// @route   GET /api/blogs/:slug
// @access  Public
router.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug });
    if (!blog) {
      return res.status(404).json({ status: 'error', message: 'Blog article not found' });
    }
    return res.json({ status: 'success', data: blog });
  } catch (error) {
    console.error('Fetch blog error:', error.message);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// @desc    Create a blog post
// @route   POST /api/blogs
// @access  Private (Admin only)
router.post('/', protect, async (req, res) => {
  const { title, summary, content, featuredImage, slug } = req.body;

  if (!title || !summary || !content) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'Title, Summary, and Content are required' 
    });
  }

  const blogSlug = slug || slugify(title);

  try {
    const existing = await Blog.findOne({ slug: blogSlug });
    if (existing) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'A blog with this title or slug already exists' 
      });
    }

    const blog = new Blog({
      title,
      slug: blogSlug,
      summary,
      content,
      featuredImage
    });

    const savedBlog = await blog.save();
    return res.status(201).json({ status: 'success', data: savedBlog });
  } catch (error) {
    console.error('Create blog error:', error.message);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// @desc    Update a blog post
// @route   PUT /api/blogs/:id
// @access  Private (Admin only)
router.put('/:id', protect, async (req, res) => {
  const { title, summary, content, featuredImage, slug } = req.body;

  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ status: 'error', message: 'Blog article not found' });
    }

    if (title) {
      blog.title = title;
      if (!slug) blog.slug = slugify(title);
    }
    if (slug) blog.slug = slug;
    if (summary !== undefined) blog.summary = summary;
    if (content !== undefined) blog.content = content;
    if (featuredImage !== undefined) blog.featuredImage = featuredImage;

    const updatedBlog = await blog.save();
    return res.json({ status: 'success', data: updatedBlog });
  } catch (error) {
    console.error('Update blog error:', error.message);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

// @desc    Delete a blog post
// @route   DELETE /api/blogs/:id
// @access  Private (Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ status: 'error', message: 'Blog article not found' });
    }

    await blog.deleteOne();
    return res.json({ status: 'success', message: 'Blog article deleted successfully' });
  } catch (error) {
    console.error('Delete blog error:', error.message);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
});

module.exports = router;
