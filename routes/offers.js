const express = require('express');
const router = express.Router();
const offerController = require('../controllers/offerController');
const auth = require('../middleware/auth');

// GET /api/offers
router.get('/', offerController.getOffers);

// POST /api/offers
router.post('/', auth, offerController.createOffer);

// PUT /api/offers/:id
router.put('/:id', auth, offerController.updateOffer);

// DELETE /api/offers/:id
router.delete('/:id', auth, offerController.deleteOffer);

module.exports = router;
