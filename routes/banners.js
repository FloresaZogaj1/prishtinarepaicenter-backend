const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const BannerModel = (() => { try { return require('../models/Banner'); } catch (e) { return null; } })();

router.get('/', async (req, res) => {
  try {
    if (!BannerModel) return res.json([]);
    const banners = await BannerModel.find().sort({ sortOrder: 1, createdAt: -1 });
    res.json(banners);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    if (!BannerModel) return res.status(404).json({ error: 'Banner model not available' });
    const b = new BannerModel(req.body || {});
    await b.save();
    res.status(201).json(b);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    if (!BannerModel) return res.status(404).json({ error: 'Banner model not available' });
    const b = await BannerModel.findByIdAndUpdate(req.params.id, req.body || {}, { new: true });
    if (!b) return res.status(404).json({ error: 'Banner not found' });
    res.json(b);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    if (!BannerModel) return res.status(404).json({ error: 'Banner model not available' });
    await BannerModel.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = router;
