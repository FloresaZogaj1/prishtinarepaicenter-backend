const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const DEFAULT_HOME = {
  hero: {
    kicker: 'SHËRBIM I PLOTË DHE CILËSI E LARTË',
    headline: 'PRISHTINA',
    subHeadline: 'REPAIR CENTER',
    sub: 'Servis profesional për veturat tuaja',
    bullets: ['Diagnostikim profesional','Riparime të avancuara','Shërbim i shpejtë'],
  },
  servicesIntro: { title: 'Shërbimet', subtitle: 'Çfarë bëjmë për veturën tuaj' },
  services: {
    item1: { title: 'Diagnostikë kompjuterike', desc: 'Zbulim i saktë i defekteve në kohë reale me pajisje profesionale.', image: '' },
    item2: { title: 'Servisim & mirëmbajtje', desc: 'Servis i rregullt, ndërrim vajrash/filtrash dhe kontroll i përgjithshëm.', image: '' },
    item3: { title: 'Limari', desc: 'Riparime aksidentesh, rregullim karrocerie, ngjyrosje profesionale dhe polirim.', image: '' },
    item4: { title: 'Detailing', desc: 'Pastrim, mbrojtje dhe rikthim i pamjes premium të veturës suaj.', image: '' },
  },
  process: {
    kicker: 'Procesi',
    title: 'Si punojmë',
    intro: 'Proces i thjeshtë, i rregullt dhe transparent — që me pas rezultat të kontrolluar.',
    step1: { title: 'Pranim & diagnozë', description: 'E dëgjojmë problemin, bëjmë kontroll fillestar dhe diagnostikë kompjuterike për me e gjet shkakun real.' },
    step2: { title: 'Ofertë & plan pune', description: 'Ta shpjegojmë qartë çka po ndërrohet/pse, sa zgjat, dhe sa kushton — para se me nis punën.' },
    step3: { title: 'Riparim me standard', description: 'Puna kryhet me mjete profesionale dhe procedurë të rregullt (mekanikë/limari/bojë), pa improvizime.' },
    step4: { title: 'Testim & dorëzim', description: 'Kontroll final + testim. Ta dorëzojmë veturën gati dhe të japim rekomandime për mirëmbajtje.' },
  },
  processSteps: {
    step1: { k: '01', t: 'Pranim & diagnozë', d: 'E dëgjojmë problemin, bëjmë kontroll fillestar dhe diagnostikë kompjuterike për me e gjet shkakun real.' },
    step2: { k: '02', t: 'Ofertë & plan pune', d: 'Ta shpjegojmë qartë çka po ndërrohet/pse, sa zgjat, dhe sa kushton — para se me nis punën.' },
    step3: { k: '03', t: 'Riparim me standard', d: 'Puna kryhet me mjete profesionale dhe procedurë të rregullt (mekanikë/limari/bojë), pa improvizime.' },
    step4: { k: '04', t: 'Testim & dorëzim', d: 'Kontroll final + testim. Ta dorëzojmë veturën gati dhe të japim rekomandime për mirëmbajtje.' },
  },
  whyCards: {
    card1: { t: 'Diagnozë e saktë', d: 'Skanim + analizë reale. Nuk i ndërrojmë pjesët kot — e gjejmë shkakun.' },
    card2: { t: 'Transparencë', d: 'Çmimi dhe plani i punës qartë. Pa surpriza në fund.' },
    card3: { t: 'Standard profesional', d: 'Procedurë e pastër nga pranim derisa dorëzim — me kontroll final.' },
    card4: { t: 'Cilësi premium', d: 'Limari/bojë me finish të rregullt. Rezultat që shihet.' },
  },
  whySection: { kicker: 'Pse PRC', title: 'Më shumë se servis', intro: 'Fokus te problemi real, jo te hamendësimi. Me standard pune dhe komunikim të pastër.' },
  faqs: {
    faq1: { q: 'Sa shpejt e merrni veturën në kontroll?', a: 'Zakonisht brenda ditës. Për diagnozë të saktë, na kontaktoni dhe e koordinojmë orarin sipas ngarkesës.' },
    faq2: { q: 'A bëni diagnozë kompjuterike?', a: 'Po. Bëjmë skanim dhe testime për me identifiku defektin real, jo vetëm simptomën.' },
    faq3: { q: 'A jepni ofertë para riparimit?', a: 'Po. Para se me nis punën, e merrni ofertën dhe afatin e pritshëm.' },
    faq4: { q: 'A punoni edhe limari/bojë?', a: 'Po. Riparime aksidentesh, rregullim karrocerie dhe ngjyrosje profesionale.' },
  },
  faqsSection: { kicker: 'FAQ', title: 'Pyetje të shpeshta', intro: 'Disa pyetje që na i bëjnë shpesh klientët.' },
  contactSummary: {
    address: 'Prishtinë – Ferizaj Km 8',
    phoneDisplay: '+383 49 815 356',
    phoneIntl: '+38349815356',
    email: 'mentor.zeqiri@prishtinarepaircenter.com',
    maps: '',
  },
  contactSection: { kicker: 'Kontakt', title: 'Na kontaktoni', intro: 'Për kërkesa, pyetje ose rezervime, na shkruani dhe do t’ju kthehemi sa më shpejt.' },
  footerText: '© 2026 Prishtina Repair Center',
};

// GET /api/pages/home
router.get('/', async (req, res) => {
  try {
    const HomeModel = (() => { try { return require('../../models/HomePageContent'); } catch (e) { return null; } })();
    if (HomeModel) {
      const doc = await HomeModel.findOne();
      if (!doc) return res.json(DEFAULT_HOME);
      // Sanitize hero.sub before returning (don't leak placeholder text)
      try {
        const sub = doc.hero && doc.hero.sub;
        if (typeof sub === 'string' && /^\s*(Sub text)\s*$/i.test(sub)) {
          // clone to avoid mutating mongoose doc
          const out = JSON.parse(JSON.stringify(doc));
          if (out.hero) out.hero.sub = undefined;
          return res.json(out);
        }
      } catch (e) { /* ignore */ }

  // Merge stored document with DEFAULT_HOME defaults so public site still
  // shows canonical content when stored fields are empty or placeholders.
      try {
        const stored = JSON.parse(JSON.stringify(doc));
        function isMeaningfulString(s) {
          if (s === undefined || s === null) return false;
          if (typeof s !== 'string') return true;
          const t = s.trim();
          if (t === '' || t === 'undefined' || t === 'null') return false;
          if (/^\s*(SMOKE|Smoke)\b/.test(t)) return false;
          if (/^\s*(Sub text)\s*$/i.test(t)) return false;
          return true;
        }
        function mergeWithDefault(existing, def) {
          if (existing === undefined || existing === null) return def;
          if (typeof def === 'string') {
            return isMeaningfulString(existing) ? existing : def;
          }
          if (typeof def !== 'object' || Array.isArray(def)) {
            // for arrays or primitives other than string, prefer existing when present
            return (existing !== undefined && existing !== null) ? existing : def;
          }
          const out = {};
          // iterate keys from def to keep canonical ordering
          for (const k of Object.keys(def)) {
            out[k] = mergeWithDefault(existing[k], def[k]);
          }
          // include any extra keys present in existing
          for (const k of Object.keys(existing || {})) {
            if (!(k in out)) out[k] = existing[k];
          }
          return out;
        }
        // Normalize legacy services shape only when stored.services exists and is NOT an array
        if (stored && stored.services && !Array.isArray(stored.services)) {
          const svcObj = stored.services || {};
          const keys = Object.keys(svcObj).filter(k => /^item\d+$/.test(k)).sort();
          if (keys.length) {
            const arr = keys.map((k, idx) => {
              const it = svcObj[k] || {};
              return {
                id: it.id || `${k}`,
                title: it.title || '',
                desc: it.desc || it.description || '',
                image: it.image || '',
                link: it.link || '',
                imageRemoved: !!it.imageRemoved,
              };
            });
            stored.services = arr;
          }
        }

        const merged = mergeWithDefault(stored, DEFAULT_HOME);
        // If stored.services was an array, prefer it exactly (avoid legacy DEFAULT_HOME.services
        // shape from accidentally turning arrays into objects during merge).
        try {
          if (stored && stored.services && Array.isArray(stored.services)) {
            merged.services = stored.services;
          }
        } catch (e) { /* ignore */ }
  // returning merged home content
        return res.json(merged);
      } catch (e) {
        // fallback to returning raw doc on any merge error
        return res.json(doc);
      }
    }
    // fallback to DEFAULT
    return res.json(DEFAULT_HOME);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/pages/home (admin)
router.put('/', auth, async (req, res) => {
  try {
    const HomeModel = (() => { try { return require('../../models/HomePageContent'); } catch (e) { return null; } })();
    if (!HomeModel) return res.status(404).json({ error: 'HomePageContent model not available' });
    let doc = await HomeModel.findOne();
    if (!doc) {
      const toCreate = (req.body && Object.keys(req.body).length) ? req.body : DEFAULT_HOME;
      doc = new HomeModel(toCreate);
      await doc.save();
      return res.status(201).json(doc);
    }
    // Sanitization: avoid persisting SMOKE/demo values or blank placeholders
    const incoming = req.body || {};
    function isSmokeString(s) {
      return typeof s === 'string' && /^\s*(SMOKE|Smoke)\b/.test(s);
    }
    function isMeaningfulString(s) {
      if (s === undefined || s === null) return false;
      if (typeof s !== 'string') return true;
      const t = s.trim();
      if (t === '' || t === 'undefined' || t === 'null') return false;
      if (isSmokeString(t)) return false;
      if (/^\s*(Sub text)\s*$/i.test(t)) return false;
      return true;
    }
    function mergeField(existing, incomingVal, defaultVal) {
      // If incomingVal is an object, recurse and merge per key
      if (incomingVal && typeof incomingVal === 'object' && !Array.isArray(incomingVal)) {
        const out = { ...(existing || {}) };
        for (const k of Object.keys(incomingVal)) {
          const inc = incomingVal[k];
          const def = defaultVal && defaultVal[k] !== undefined ? defaultVal[k] : undefined;
          if (inc && typeof inc === 'object' && !Array.isArray(inc)) {
            out[k] = mergeField(out[k], inc, def);
          } else if (isMeaningfulString(inc) || (inc !== undefined && typeof inc !== 'string')) {
            out[k] = inc;
          } else if (typeof inc === 'string' && inc === '' && ['media', 'image', 'poster'].includes(k)) {
            // Allow explicit empty strings for media/image fields so a removal can
            // be persisted (frontend intentionally sends media: '' when removing)
            out[k] = inc;
          } // else skip meaningless incoming value and keep existing
        }
        return out;
      }
      // Primitive value: only accept if meaningful
      if (isMeaningfulString(incomingVal)) return incomingVal;
      if (existing !== undefined) return existing;
      return defaultVal;
    }

    // Apply merge/clean for known top-level fields
    doc.hero = mergeField(doc.hero, incoming.hero, DEFAULT_HOME.hero);
    doc.servicesIntro = mergeField(doc.servicesIntro, incoming.servicesIntro, DEFAULT_HOME.servicesIntro);
    // process (new fixed schema)
    if (incoming.process) {
      doc.process = mergeField(doc.process, incoming.process, DEFAULT_HOME.process);
    } else if (incoming.processSteps) {
      // support legacy shape by converting processSteps -> process
      const ps = incoming.processSteps || {};
      const converted = {
        kicker: ps.kicker || DEFAULT_HOME.process.kicker,
        title: ps.title || DEFAULT_HOME.process.title,
        intro: ps.intro || DEFAULT_HOME.process.intro,
        step1: { title: ps.step1?.t || ps.step1?.title || DEFAULT_HOME.process.step1.title, description: ps.step1?.d || ps.step1?.description || DEFAULT_HOME.process.step1.description },
        step2: { title: ps.step2?.t || ps.step2?.title || DEFAULT_HOME.process.step2.title, description: ps.step2?.d || ps.step2?.description || DEFAULT_HOME.process.step2.description },
        step3: { title: ps.step3?.t || ps.step3?.title || DEFAULT_HOME.process.step3.title, description: ps.step3?.d || ps.step3?.description || DEFAULT_HOME.process.step3.description },
        step4: { title: ps.step4?.t || ps.step4?.title || DEFAULT_HOME.process.step4.title, description: ps.step4?.d || ps.step4?.description || DEFAULT_HOME.process.step4.description },
      };
      doc.process = mergeField(doc.process, converted, DEFAULT_HOME.process);
    } else {
      doc.process = doc.process || DEFAULT_HOME.process;
    }
    // keep legacy processSteps field as-is for now (but sanitize values)
    doc.processSteps = mergeField(doc.processSteps, incoming.processSteps, DEFAULT_HOME.processSteps);
  // Accept incoming.services as either legacy object with item1..item4 or as array
    // Normalize to array of cards with stable ids before persisting.
  // normalize incoming.services below
    if (incoming.services) {
      if (Array.isArray(incoming.services)) {
        // ensure each has an id
        const normalized = incoming.services.map((it, i) => ({
          id: it.id || String(it._id || it.id || ('svc-' + i)),
          title: it.title || '',
          desc: it.desc || it.description || '',
          image: it.image || '',
          link: it.link || '',
          imageRemoved: !!it.imageRemoved,
        }));
  doc.services = normalized;
      } else if (typeof incoming.services === 'object') {
        // legacy object with keys item1..itemN
        const svcObj = incoming.services || {};
        const keys = Object.keys(svcObj).filter(k => /^item\d+$/.test(k)).sort();
        if (keys.length) {
          const arr = keys.map((k, idx) => {
            const it = svcObj[k] || {};
            return {
              id: it.id || `${k}`,
              title: it.title || '',
              desc: it.desc || it.description || '',
              image: it.image || '',
              link: it.link || '',
              imageRemoved: !!it.imageRemoved,
            };
          });
          doc.services = arr;
          // normalized legacy object to array
        } else {
          // no itemN keys: treat as map of arbitrary keys -> convert preserving keys
          const keys2 = Object.keys(svcObj);
          const arr = keys2.map((k, idx) => {
            const it = svcObj[k] || {};
            return {
              id: it.id || k,
              title: it.title || '',
              desc: it.desc || it.description || '',
              image: it.image || '',
              link: it.link || '',
              imageRemoved: !!it.imageRemoved,
            };
          });
          doc.services = arr;
          // normalized map to array
        }
      }
    } else {
      // no incoming.services: preserve existing doc.services or default
      doc.services = doc.services || DEFAULT_HOME.services;
          // no incoming.services: preserve existing
    }
    doc.whySection = mergeField(doc.whySection, incoming.whySection, DEFAULT_HOME.whySection);
    doc.whyCards = mergeField(doc.whyCards, incoming.whyCards, DEFAULT_HOME.whyCards);
    doc.faqsSection = mergeField(doc.faqsSection, incoming.faqsSection, DEFAULT_HOME.faqsSection);
    doc.faqs = mergeField(doc.faqs, incoming.faqs, DEFAULT_HOME.faqs);
    doc.contactSummary = mergeField(doc.contactSummary, incoming.contactSummary, DEFAULT_HOME.contactSummary);
    doc.contactSection = mergeField(doc.contactSection, incoming.contactSection, DEFAULT_HOME.contactSection);
    doc.footerText = isMeaningfulString(incoming.footerText) ? incoming.footerText : (doc.footerText || DEFAULT_HOME.footerText);
    const saved = await doc.save();
  // saved and returning document
    return res.json(saved);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = router;
