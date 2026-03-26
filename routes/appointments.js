const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const auth = require('../middleware/auth');

// GET /api/appointments
router.get('/', appointmentController.getAppointments);

// GET /api/appointments/:id
router.get('/:id', appointmentController.getAppointmentById);

// POST /api/appointments (public: frontend booking form)
router.post('/', appointmentController.createAppointment);

// PUT /api/appointments/:id
router.put('/:id', auth, appointmentController.updateAppointment);

// DELETE /api/appointments/:id
router.delete('/:id', auth, appointmentController.deleteAppointment);

// PATCH /api/appointments/:id/status
router.patch('/:id/status', auth, appointmentController.updateAppointmentStatus);

module.exports = router;
