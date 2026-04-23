/**
 * Seed script for backend copy: creates SiteContent in the backend DB if missing
 * Run: node backend/scripts/seedSiteContentBackend.js from repo root
 */
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', 'backend', '.env') });

const fs = require('fs');
// Try to require SiteContent model from backend models; if missing, create inline schema
let SiteContentModel;
try {
  SiteContentModel = require('../models/SiteContent');
} catch (e) {
  // If backend doesn't have SiteContent model, create minimal model
  const mongoose2 = require('mongoose');
  const Schema = mongoose2.Schema;
  const SiteContentSchema = new Schema({ hero: Object, contact: Object, social: Object, footerText: String, bannersEnabled: Boolean }, { timestamps: true });
  SiteContentModel = mongoose2.model('SiteContent', SiteContentSchema);
}

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

async function run() {
  const uri = process.env.MONGO_URI || process.env.LOCAL_MONGO_URI || 'mongodb://127.0.0.1:27017/prishtinarepaircenterdb';
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    let doc = await SiteContentModel.findOne();
    if (doc) {
      console.log('SiteContent already present in backend DB.');
      console.log(doc);
      process.exit(0);
    }
    doc = new SiteContentModel(DEFAULT_SITE_CONTENT);
    await doc.save();
    console.log('SiteContent seeded to backend DB.');
    console.log(doc);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

run();
