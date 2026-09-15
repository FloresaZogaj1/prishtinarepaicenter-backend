const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const DEFAULT = {
  heroTitle: 'E BËJMË SERVISIN MË TË LEHTË DHE TË SIGURT',
  heroDescription: 'Prishtina Repair Center është zgjedhja juaj për shërbime të plota, të shpejta dhe të besueshme për çdo veturë.',
  stats: { expertPct: '95%', cleanPct: '99%' },
  servicesBlockTitle: 'SHËRBIMET TONA',
  servicesBlockItems: ['Ndërrimi i rripit të kohës','Diagnostikimi i veturës','Ndërrimi i fërkimit (clutch)'],
  recentWorks: [],
  heroImage: '',
  howToTitle: 'SI TË SERVISNI VETURËN',
  howToDescription: 'Mos i lini shërbimet tuaja pa u kryer! Ndiqni këto hapa...',
};

router.get('/', async (req, res) => {
  try {
    const Model = (() => { try { return require('../../models/AboutPageContent'); } catch (e) { return null; } })();
    if (Model) { const doc = await Model.findOne(); if (!doc) return res.json(DEFAULT); return res.json(doc); }
    return res.json(DEFAULT);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/', auth, async (req, res) => {
  try {
    const Model = (() => { try { return require('../../models/AboutPageContent'); } catch (e) { return null; } })();
    if (!Model) return res.status(404).json({ error: 'Model not available' });
    let doc = await Model.findOne();
    if (!doc) { const toCreate = (req.body && Object.keys(req.body).length) ? req.body : DEFAULT; doc = new Model(toCreate); await doc.save(); return res.status(201).json(doc); }
    const incoming = req.body || {};
    // preserve existing values unless incoming explicitly sets them
    if (Object.prototype.hasOwnProperty.call(incoming, 'heroTitle')) doc.heroTitle = incoming.heroTitle;
    if (Object.prototype.hasOwnProperty.call(incoming, 'heroDescription')) doc.heroDescription = incoming.heroDescription;
    if (Object.prototype.hasOwnProperty.call(incoming, 'stats')) doc.stats = incoming.stats;
    if (Object.prototype.hasOwnProperty.call(incoming, 'servicesBlockTitle')) doc.servicesBlockTitle = incoming.servicesBlockTitle;
    // preserve presence semantics for servicesList: allow explicit [] to persist
    if (Object.prototype.hasOwnProperty.call(incoming, 'servicesList')) {
      doc.servicesList = Array.isArray(incoming.servicesList) ? incoming.servicesList : [];
    }
    // Back-compat: servicesBlockItems remains supported as a simple string array
    if (Object.prototype.hasOwnProperty.call(incoming, 'servicesBlockItems')) doc.servicesBlockItems = incoming.servicesBlockItems;
    if (Object.prototype.hasOwnProperty.call(incoming, 'recentWorks')) doc.recentWorks = incoming.recentWorks;
    if (Object.prototype.hasOwnProperty.call(incoming, 'heroImage')) doc.heroImage = incoming.heroImage;
    if (Object.prototype.hasOwnProperty.call(incoming, 'howToTitle')) doc.howToTitle = incoming.howToTitle;
    if (Object.prototype.hasOwnProperty.call(incoming, 'howToDescription')) doc.howToDescription = incoming.howToDescription;
    await doc.save();
    return res.json(doc);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = router;
