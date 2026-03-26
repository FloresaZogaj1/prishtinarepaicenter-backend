const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const auth = require('../middleware/auth');

// GET /api/content
router.get('/', contentController.getContent);

// GET /api/content/:sectionKey
router.get('/:sectionKey', contentController.getContentBySectionKey);

// PUT /api/content/:sectionKey
router.put('/:sectionKey', auth, contentController.updateContentBySectionKey);

module.exports = router;
