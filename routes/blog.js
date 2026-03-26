const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const auth = require('../middleware/auth');

// GET /api/blog
router.get('/', blogController.getBlogPosts);

// GET /api/blog/:id
router.get('/:id', blogController.getBlogPostById);

// POST /api/blog
router.post('/', auth, blogController.createBlogPost);

// PUT /api/blog/:id
router.put('/:id', auth, blogController.updateBlogPost);

// DELETE /api/blog/:id
router.delete('/:id', auth, blogController.deleteBlogPost);

module.exports = router;
