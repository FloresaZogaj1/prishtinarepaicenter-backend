const express = require('express');
const router = express.Router();
const vehicleController = require('../controllers/vehicleController');
const auth = require('../middleware/auth');

// GET /api/vehicles
router.get('/', vehicleController.getVehicles);

// GET /api/vehicles/:id
router.get('/:id', vehicleController.getVehicleById);

// POST /api/vehicles
router.post('/', auth, vehicleController.createVehicle);

// PUT /api/vehicles/:id
router.put('/:id', auth, vehicleController.updateVehicle);

// DELETE /api/vehicles/:id
router.delete('/:id', auth, vehicleController.deleteVehicle);

module.exports = router;
