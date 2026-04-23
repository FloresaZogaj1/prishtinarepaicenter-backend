const mongoose = require('mongoose');

const ServicesPageContentSchema = new mongoose.Schema({
  pageTitle: { type: String },
  intro: { type: String },
  featuredServices: { type: [Object], default: [] }, // expected fixed slots (e.g., 4)
  updatedAt: { type: Date, default: Date.now },
});

ServicesPageContentSchema.pre('save', function (next) { this.updatedAt = Date.now(); next(); });

module.exports = mongoose.model('ServicesPageContent', ServicesPageContentSchema);
