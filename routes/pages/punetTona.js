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

    // Split works out immediately and never allow raw incoming.works to be
    // passed to Mongoose (either in constructor or via assignment).
    const { works: incomingWorks, ...otherFields } = incoming;

    if (!doc) {
      // Create using only non-works fields. Attach works separately after cleaning.
      const base = (otherFields && Object.keys(otherFields).length) ? otherFields : DEFAULT;
      doc = new Model(base);

      // If incoming included works, sanitize and assign before initial save
      if (Object.prototype.hasOwnProperty.call(incoming, 'works')) {
        const cleanWorks = Array.isArray(incomingWorks)
          ? incomingWorks.map((item) => {
              const clean = { ...item };
              // UUID/frontend IDs must NEVER enter Mongo `_id`
              if (clean._id) delete clean._id;
              return clean;
            })
          : [];
        doc.works = cleanWorks;
      }

      await doc.save();
      return res.status(201).json(doc);
    }

    // Update normal fields (excluding works) defensively
    Object.keys(otherFields || {}).forEach((key) => {
      doc[key] = otherFields[key];
    });

    // Handle works separately and defensively
    if (Object.prototype.hasOwnProperty.call(incoming, 'works')) {
      const cleanWorks = Array.isArray(incomingWorks)
        ? incomingWorks.map((item) => {
            const clean = { ...item };
            if (clean._id) delete clean._id;
            return clean;
          })
        : [];
      doc.works = cleanWorks;
    }

    // Log the cleaned _id values to verify they are Mongoose ObjectIds (or undefined)
    try {
      console.log(
        '[PUNET TONA CLEAN WORK IDS]',
        Array.isArray(doc.works) ? doc.works.map((x) => String(x._id)) : []
      );
    } catch (e) {
      // swallow logging errors
    }

    await doc.save();
    return res.json(doc);
  } catch (err) {
    console.error('PunetTona save validation:', err && err.message ? err.message : err);
    return res.status(400).json({ error: err && err.message ? err.message : 'Validation failed' });
  }
});

module.exports = router;
