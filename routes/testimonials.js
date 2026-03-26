const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonialController');
const auth = require('../middleware/auth');

// GET /api/testimonials
router.get('/', testimonialController.getTestimonials);

// POST /api/testimonials
router.post('/', auth, testimonialController.createTestimonial);

// PUT /api/testimonials/:id
router.put('/:id', auth, testimonialController.updateTestimonial);

// DELETE /api/testimonials/:id
router.delete('/:id', auth, testimonialController.deleteTestimonial);

module.exports = router;
