const mongoose = require('mongoose');

const DiagnostikeKompjuterikePageContentSchema = new mongoose.Schema({
  heroTitle: { type: String },
  heroIntro: { type: String },
  heroImage: { type: String },
  heroImageRemoved: { type: Boolean, default: false },
  featuresIntro: { type: String },
  features: { type: [{ id: String, title: String, description: String }], default: undefined },
  processImage: { type: String },
  processImageRemoved: { type: Boolean, default: false },
  processIntro: { type: String },
  horizontalTitle: { type: String },
  horizontalDesc: { type: String },
  processSteps: { type: [{ id: String, text: String }], default: undefined },
  video: {
    src: { type: String },
    poster: { type: String },
    removed: { type: Boolean, default: false }
  },
  updatedAt: { type: Date, default: Date.now },
});

DiagnostikeKompjuterikePageContentSchema.pre('save', function(next) { this.updatedAt = Date.now(); next(); });

module.exports = mongoose.model('DiagnostikeKompjuterikePageContent', DiagnostikeKompjuterikePageContentSchema);
