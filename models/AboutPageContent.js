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
  // New CMS-managed services list (admin-managed objects).
  // Stored as an array of objects: { id: String, title: String, iconKey: String }
  // Default is undefined so absence can be distinguished from an explicit empty array.
  servicesList: { type: [{ id: String, title: String, iconKey: String }], default: undefined },
  recentWorks: { type: [Object], default: [] }, // fixed set expected in UI
  howToTitle: { type: String },
  howToDescription: { type: String },
  updatedAt: { type: Date, default: Date.now },
});

AboutPageContentSchema.pre('save', function (next) { this.updatedAt = Date.now(); next(); });

module.exports = mongoose.model('AboutPageContent', AboutPageContentSchema);
