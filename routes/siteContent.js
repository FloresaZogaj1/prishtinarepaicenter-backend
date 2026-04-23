const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const SiteContent = require('../models/Setting') || null; // fallback if model not present

// Simple in-route handlers to avoid adding new backend controllers.
// If a dedicated SiteContent model exists under server, backend may be a legacy copy.

const DEFAULT_SITE_CONTENT = {
  hero: {
    headline: "Prishtina Repair Center",
    sub: "Servis profesional për veturat tuaja",
    bullets: ["Diagnostikim profesional","Riparime të avancuara","Shërbim i shpejtë"],
  },
  contact: {
    phoneDisplay: "+383 49 815 356",
    phoneIntl: "+38349815356",
    email: "mentor.zeqiri@prishtinarepaircenter.com",
    address: "Prishtinë – Ferizaj Km 8",
    maps: "PASTE_GOOGLE_MAPS_LINK_HERE",
  },
  social: { facebook: "PASTE_FACEBOOK_LINK_HERE", instagram: "PASTE_INSTAGRAM_LINK_HERE" },
  footerText: "© 2026 Prishtina Repair Center",
  bannersEnabled: true,
};

// GET /api/site-content
router.get('/', async (req, res) => {
  try {
    // Try to load a SiteContent model if present, otherwise attempt to read from settings
    const SiteContentModel = (() => {
      try { return require('../models/SiteContent'); } catch (e) { return null; }
    })();

    if (SiteContentModel) {
      const doc = await SiteContentModel.findOne();
      if (!doc) return res.json(DEFAULT_SITE_CONTENT);
      return res.json(doc);
    }

    // Fallback: try to use existing Setting model and map common fields
    try {
      const Setting = require('../models/Setting');
      const s = await Setting.findOne();
      const out = {
        hero: { headline: s?.siteTitle || '', sub: s?.siteSubtitle || '', bullets: [] },
        contact: { phoneDisplay: s?.phoneDisplay || '', phoneIntl: s?.phoneIntl || '', email: s?.contactEmail || '', address: s?.address || '', maps: s?.maps || '' },
        social: s?.social || {},
        footerText: s?.footerText || '',
        bannersEnabled: s?.bannersEnabled ?? true,
      };
      return res.json(out);
    } catch (e) {
      return res.json(DEFAULT_SITE_CONTENT);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/site-content
router.put('/', auth, async (req, res) => {
  try {
    const SiteContentModel = (() => {
      try { return require('../models/SiteContent'); } catch (e) { return null; }
    })();
    if (SiteContentModel) {
      let doc = await SiteContentModel.findOne();
      if (!doc) {
        const toCreate = (req.body && Object.keys(req.body).length) ? req.body : DEFAULT_SITE_CONTENT;
        doc = new SiteContentModel(toCreate);
        await doc.save();
        return res.status(201).json(doc);
      }
      Object.assign(doc, req.body || {});
      await doc.save();
      return res.json(doc);
    }

    // Fallback to Setting model if present (best-effort mapping)
    try {
      const Setting = require('../models/Setting');
      let s = await Setting.findOne();
      if (!s) { s = new Setting((req.body && Object.keys(req.body).length) ? req.body : DEFAULT_SITE_CONTENT); await s.save(); return res.status(201).json(s); }
      Object.assign(s, req.body || {});
      await s.save();
      return res.json(s);
    } catch (e) {
      return res.status(404).json({ error: 'No SiteContent or Setting model available in backend copy' });
    }
  } catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = router;
