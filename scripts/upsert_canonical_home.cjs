const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function main() {
  // Prefer MONGO_URI (active DB used by the server) so we update the same database the backend is connected to.
  const uri = process.env.MONGO_URI || process.env.LOCAL_MONGO_URI || 'mongodb://127.0.0.1:27017/prishtinarepaircenterdb';
  console.log('Connecting to MongoDB at', uri);
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  const HomeModel = require(path.join(__dirname, '..', 'models', 'HomePageContent'));

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

  const existing = await HomeModel.findOne();
  if (existing) {
    console.log('Updating existing HomePageContent document (id:', existing._id, ')');
    await HomeModel.updateOne({ _id: existing._id }, { $set: DEFAULT_HOME });
    console.log('Update complete');
  } else {
    console.log('No existing doc found: creating new HomePageContent');
    const doc = new HomeModel(DEFAULT_HOME);
    await doc.save();
    console.log('Create complete. id:', doc._id);
  }

  const doc2 = await HomeModel.findOne().lean();
  console.log('Final document stored (preview):');
  console.log(JSON.stringify(doc2, null, 2).slice(0, 2000));

  await mongoose.disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
