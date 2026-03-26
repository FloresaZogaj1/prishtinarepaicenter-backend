const express = require('express');
const router = express.Router();
const workOrderController = require('../controllers/workOrderController');
const auth = require('../middleware/auth');

// GET /api/work-orders
router.get('/', workOrderController.getWorkOrders);

// GET /api/work-orders/:id
router.get('/:id', workOrderController.getWorkOrderById);

// POST /api/work-orders
router.post('/', auth, workOrderController.createWorkOrder);

// PUT /api/work-orders/:id
router.put('/:id', auth, workOrderController.updateWorkOrder);

// DELETE /api/work-orders/:id
router.delete('/:id', auth, workOrderController.deleteWorkOrder);

// PATCH /api/work-orders/:id/status
router.patch('/:id/status', auth, workOrderController.updateWorkOrderStatus);

module.exports = router;
