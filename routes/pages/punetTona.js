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
    if (Object.prototype.hasOwnProperty.call(incoming, 'works')) {
      const cleanWorks = Array.isArray(incoming.works)
        ? incoming.works.map((item) => {
            const clean = { ...item };
            // Never trust frontend subdocument _id — strip it so Mongoose assigns valid ObjectIds
            if (clean._id) delete clean._id;
            return clean;
          })
        : [];
      doc.works = cleanWorks;
    }
    await doc.save();
    return res.json(doc);
  } catch (err) {
    console.error('PunetTona save validation:', err && err.message ? err.message : err);
    return res.status(400).json({ error: err && err.message ? err.message : 'Validation failed' });
  }
});

module.exports = router;
