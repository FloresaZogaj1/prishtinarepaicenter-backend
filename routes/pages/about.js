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
    doc.heroTitle = incoming.heroTitle || '';
    doc.heroDescription = incoming.heroDescription || '';
    doc.stats = incoming.stats || {};
  doc.servicesBlockTitle = incoming.servicesBlockTitle || '';
  doc.servicesBlockItems = incoming.servicesBlockItems || [];
  doc.recentWorks = incoming.recentWorks || [];
  doc.heroImage = incoming.heroImage || '';
    doc.howToTitle = incoming.howToTitle || '';
    doc.howToDescription = incoming.howToDescription || '';
    await doc.save();
    return res.json(doc);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = router;
