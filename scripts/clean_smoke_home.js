// One-off script to clean SMOKE/Smoke test strings from HomePageContent
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const SMOKE_RE = /^\s*(SMOKE|Smoke)\b/;

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
  processSteps: {},
  whyCards: {},
  whySection: { kicker: 'Pse PRC', title: 'Më shumë se servis', intro: 'Fokus te problemi real, jo te hamendësimi. Me standard pune dhe komunikim të pastër.' },
  faqs: {},
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

function isSmoke(v) {
  return typeof v === 'string' && SMOKE_RE.test(v);
}

function cleanValue(curr, def) {
  if (curr == null) return curr;
  if (typeof curr === 'string') {
    if (isSmoke(curr)) return (def !== undefined ? def : null);
    // also trim accidental whitespace-only
    if (curr.trim() === '') return (def !== undefined ? def : curr);
    return curr;
  }
  if (Array.isArray(curr)) {
    return curr.map((it, idx) => cleanValue(it, Array.isArray(def) ? def[idx] : undefined));
  }
  if (typeof curr === 'object') {
    const out = {};
    const keys = new Set([...Object.keys(curr || {}), ...Object.keys(def || {})]);
    for (const k of keys) {
      out[k] = cleanValue(curr ? curr[k] : undefined, def ? def[k] : undefined);
    }
    return out;
  }
  return curr;
}

async function main() {
  const uri = process.env.MONGO_URI || process.env.LOCAL_MONGO_URI || 'mongodb://127.0.0.1:27017/prishtinarepaircenterdb';
  console.log('Connecting to MongoDB:', uri.replace(/(.{20}).+/, '$1...'));
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected');
  const HomeModel = (() => { try { return require('../models/HomePageContent'); } catch (e) { console.error('Model load failed', e); return null; } })();
  if (!HomeModel) { console.error('Home model not found'); process.exit(1); }
  const doc = await HomeModel.findOne();
  if (!doc) {
    console.log('No HomePageContent doc found, creating default...');
    const newDoc = new HomeModel(DEFAULT_HOME);
    await newDoc.save();
    console.log('Default home created');
    process.exit(0);
  }
  const before = doc.toObject();
  const cleaned = cleanValue(before, DEFAULT_HOME);
  const changed = [];
  // Only set known top-level schema fields (safe assignment)
  const allowedKeys = [
    'hero','servicesIntro','services','process','processSteps','whySection','whyCards','faqs','faqsSection','contactSummary','contactSection','footerText'
  ];
  for (const k of allowedKeys) {
    const curr = before[k];
    const cand = cleaned[k] !== undefined ? cleaned[k] : (DEFAULT_HOME[k] !== undefined ? DEFAULT_HOME[k] : curr);
    // deep compare simple JSON
    const a = JSON.stringify(curr === undefined ? null : curr);
    const b = JSON.stringify(cand === undefined ? null : cand);
    if (a !== b) {
      changed.push({ key: k, before: curr, after: cand });
      doc[k] = cand;
    }
  }
  if (changed.length === 0) {
    console.log('No SMOKE values found; no changes made.');
    process.exit(0);
  }
  await doc.save();
  console.log('Updated HomePageContent. Changes:');
  changed.forEach(c => console.log('-', c.key, '->', c.after));
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
