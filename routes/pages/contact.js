const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const DEFAULT = {
  title: 'Keni pyetje? Na kontaktoni!',
  subtitle: 'Për kërkesa, pyetje ose rezervime, na shkruani dhe do t’ju kthehemi sa më shpejt.',
  address: '',
  phoneDisplay: '',
  phoneIntl: '',
  email: '',
  maps: '',
};

router.get('/', async (req, res) => {
  try {
    const Model = (() => { try { return require('../../models/ContactPageContent'); } catch (e) { return null; } })();
    if (Model) { const doc = await Model.findOne(); if (!doc) return res.json(DEFAULT); return res.json(doc); }
    return res.json(DEFAULT);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/', auth, async (req, res) => {
  try {
    const Model = (() => { try { return require('../../models/ContactPageContent'); } catch (e) { return null; } })();
    if (!Model) return res.status(404).json({ error: 'Model not available' });
    let doc = await Model.findOne();
    if (!doc) { const toCreate = (req.body && Object.keys(req.body).length) ? req.body : DEFAULT; doc = new Model(toCreate); await doc.save(); return res.status(201).json(doc); }
    const incoming = req.body || {};
    // Only overwrite fields that the client explicitly provided (presence semantics)
    const has = Object.prototype.hasOwnProperty.call.bind(Object.prototype.hasOwnProperty);
    if (has(incoming, 'title')) doc.title = incoming.title;
    if (has(incoming, 'subtitle')) doc.subtitle = incoming.subtitle;
    if (has(incoming, 'address')) doc.address = incoming.address;
    if (has(incoming, 'phoneDisplay')) doc.phoneDisplay = incoming.phoneDisplay;
    if (has(incoming, 'phoneIntl')) doc.phoneIntl = incoming.phoneIntl;
    if (has(incoming, 'email')) doc.email = incoming.email;
    if (has(incoming, 'maps')) doc.maps = incoming.maps;
    // Persist additional admin fields when provided (presence-based)
    if (has(incoming, 'hours')) doc.hours = incoming.hours;
    if (has(incoming, 'whatsapp')) doc.whatsapp = incoming.whatsapp;
    if (has(incoming, 'social')) doc.social = incoming.social;
    await doc.save();
    return res.json(doc);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = router;
