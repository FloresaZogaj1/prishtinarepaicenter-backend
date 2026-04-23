const mongoose = require('mongoose');

const AboutPageContentSchema = new mongoose.Schema({
  heroTitle: { type: String },
  heroDescription: { type: String },
  stats: {
    expertPct: { type: String },
    cleanPct: { type: String },
  },
  heroImage: { type: String },
  servicesBlockTitle: { type: String },
  servicesBlockItems: { type: [String], default: [] },
  recentWorks: { type: [Object], default: [] }, // fixed set expected in UI
  howToTitle: { type: String },
  howToDescription: { type: String },
  updatedAt: { type: Date, default: Date.now },
});

AboutPageContentSchema.pre('save', function (next) { this.updatedAt = Date.now(); next(); });

module.exports = mongoose.model('AboutPageContent', AboutPageContentSchema);
