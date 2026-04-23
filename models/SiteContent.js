const mongoose = require('mongoose');

const SiteContentSchema = new mongoose.Schema({
  // Single document containing site-wide editable content
  hero: {
    headline: { type: String },
    sub: { type: String },
    bullets: { type: [String], default: [] },
    media: { type: String },
    poster: { type: String },
  },
  contact: {
    phoneDisplay: { type: String },
    phoneIntl: { type: String },
    email: { type: String },
    address: { type: String },
    maps: { type: String },
  },
  social: {
    facebook: { type: String },
    instagram: { type: String },
    youtube: { type: String },
    linkedin: { type: String },
  },
  footerText: { type: String },
  bannersEnabled: { type: Boolean, default: true },
  updatedAt: { type: Date, default: Date.now },
});

SiteContentSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('SiteContent', SiteContentSchema);
