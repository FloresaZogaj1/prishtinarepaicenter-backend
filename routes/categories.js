const express = require('express');
const router = express.Router();
const serviceCategoryController = require('../controllers/serviceCategoryController');
const auth = require('../middleware/auth');

// GET /api/categories
router.get('/', serviceCategoryController.getCategories);

// POST /api/categories
router.post('/', auth, serviceCategoryController.createCategory);

// PUT /api/categories/:id
router.put('/:id', auth, serviceCategoryController.updateCategory);

// DELETE /api/categories/:id
router.delete('/:id', auth, serviceCategoryController.deleteCategory);

module.exports = router;
