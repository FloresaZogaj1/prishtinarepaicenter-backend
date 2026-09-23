
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


// Update - apply partial assignment to avoid overwriting unspecified fields
router.put('/:id', auth, async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: 'Shërbimi nuk u gjet!' });

    // Only copy fields that are present in the request body (including empty strings)
    Object.keys(req.body).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        service[key] = req.body[key];
      }
    });

    await service.save();
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
