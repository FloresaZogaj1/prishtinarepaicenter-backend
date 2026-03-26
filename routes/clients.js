const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const auth = require('../middleware/auth');

// GET /api/clients
router.get('/', clientController.getClients);

// GET /api/clients/:id
router.get('/:id', clientController.getClientById);

// POST /api/clients
router.post('/', auth, clientController.createClient);

// PUT /api/clients/:id
router.put('/:id', auth, clientController.updateClient);

// DELETE /api/clients/:id
router.delete('/:id', auth, clientController.deleteClient);

module.exports = router;
