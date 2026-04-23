const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const DEFAULT = {
  pageTitle: 'Shërbimet',
  intro: 'Zgjidhje premium për pamje dhe mbrojtje, plus shërbime profesionale për mirëmbajtje.',
  featuredServices: [],
};

router.get('/', async (req, res) => {
  try {
    const Model = (() => { try { return require('../../models/ServicesPageContent'); } catch (e) { return null; } })();
    if (Model) { const doc = await Model.findOne(); if (!doc) return res.json(DEFAULT); return res.json(doc); }
    return res.json(DEFAULT);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/', auth, async (req, res) => {
  try {
    const Model = (() => { try { return require('../../models/ServicesPageContent'); } catch (e) { return null; } })();
    if (!Model) return res.status(404).json({ error: 'Model not available' });
    let doc = await Model.findOne();
    if (!doc) { const toCreate = (req.body && Object.keys(req.body).length) ? req.body : DEFAULT; doc = new Model(toCreate); await doc.save(); return res.status(201).json(doc); }
    const incoming = req.body || {};
    doc.pageTitle = incoming.pageTitle || '';
    doc.intro = incoming.intro || '';
    doc.featuredServices = incoming.featuredServices || [];
    await doc.save();
    return res.json(doc);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = router;
