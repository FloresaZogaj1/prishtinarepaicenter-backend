
const express = require('express');
const Service = require('../models/Service');
const auth = require('../middleware/auth');
const { serviceValidation, validate } = require('../middleware/validation');
const router = express.Router();


// Create
router.post('/', auth, serviceValidation, validate, async (req, res, next) => {
  try {
    const service = new Service(req.body);
    await service.save();
    res.status(201).json(service);
  } catch (err) {
    next(err);
  }
});


// Read all
router.get('/', async (req, res, next) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (err) {
    next(err);
  }
});


// Update
router.put('/:id', auth, serviceValidation, validate, async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!service) return res.status(404).json({ error: 'Shërbimi nuk u gjet!' });
    res.json(service);
  } catch (err) {
    next(err);
  }
});


// Delete
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ error: 'Shërbimi nuk u gjet!' });
    res.json({ message: 'U fshi me sukses!' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
