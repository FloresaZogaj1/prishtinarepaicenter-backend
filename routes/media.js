const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const auth = require('../middleware/auth');

// GET /api/media
router.get('/', mediaController.getMedia);

// POST /api/media/upload
router.post('/upload', auth, mediaController.uploadMedia);

// PUT /api/media/:id
router.put('/:id', auth, mediaController.updateMedia);

// DELETE /api/media/:id
router.delete('/:id', auth, mediaController.deleteMedia);

module.exports = router;
