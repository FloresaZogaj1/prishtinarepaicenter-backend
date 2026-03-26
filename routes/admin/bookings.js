const express = require('express');
const router = express.Router();
const bookingController = require('../../controllers/bookingController');
const auth = require('../../middleware/auth');

// All routes here are protected admin routes
router.get('/', auth, bookingController.getBookings);
router.get('/:id', auth, bookingController.getBookingById);
router.post('/', auth, bookingController.createBooking);
router.put('/:id', auth, bookingController.updateBooking);
router.delete('/:id', auth, bookingController.deleteBooking);

module.exports = router;
