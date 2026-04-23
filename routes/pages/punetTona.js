const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const DEFAULT = {
  works: [],
};

router.get('/', async (req, res) => {
  try {
    const Model = (() => { try { return require('../../models/PunetTonaPageContent'); } catch (e) { return null; } })();
    if (Model) { const doc = await Model.findOne(); if (!doc) return res.json(DEFAULT); return res.json(doc); }
    return res.json(DEFAULT);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/', auth, async (req, res) => {
  try {
    const Model = (() => { try { return require('../../models/PunetTonaPageContent'); } catch (e) { return null; } })();
    if (!Model) return res.status(404).json({ error: 'Model not available' });
    let doc = await Model.findOne();
    const incoming = req.body || {};
    if (!doc) { const toCreate = (incoming && Object.keys(incoming).length) ? incoming : DEFAULT; doc = new Model(toCreate); await doc.save(); return res.status(201).json(doc); }
    // Replace entire works array when provided (safe authoritative parent)
    doc.works = Array.isArray(incoming.works) ? incoming.works : doc.works;
    await doc.save();
    return res.json(doc);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = router;
