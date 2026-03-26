const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const auth = require('../middleware/auth');

// Public: list bookings
router.get('/', bookingController.getBookings);

// Public: create a booking (frontend form)
router.post('/', bookingController.createBooking);

// Admin operations (protected)
router.get('/:id', auth, bookingController.getBookingById);
router.put('/:id', auth, bookingController.updateBooking);
router.delete('/:id', auth, bookingController.deleteBooking);

module.exports = router;
