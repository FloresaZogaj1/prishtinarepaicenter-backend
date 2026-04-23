const mongoose = require('mongoose');

const DiagnostikeKompjuterikePageContentSchema = new mongoose.Schema({
  heroTitle: { type: String },
  heroIntro: { type: String },
  heroImage: { type: String },
  featuresIntro: { type: String },
  processImage: { type: String },
  processIntro: { type: String },
  horizontalTitle: { type: String },
  horizontalDesc: { type: String },
  updatedAt: { type: Date, default: Date.now },
});

DiagnostikeKompjuterikePageContentSchema.pre('save', function(next) { this.updatedAt = Date.now(); next(); });

module.exports = mongoose.model('DiagnostikeKompjuterikePageContent', DiagnostikeKompjuterikePageContentSchema);
