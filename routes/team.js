const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');
const auth = require('../middleware/auth');

// GET /api/team
router.get('/', staffController.getStaff);

// GET /api/team/:id
router.get('/:id', staffController.getStaffById);

// POST /api/team
router.post('/', auth, staffController.createStaff);

// PUT /api/team/:id
router.put('/:id', auth, staffController.updateStaff);

// DELETE /api/team/:id
router.delete('/:id', auth, staffController.deleteStaff);

module.exports = router;
