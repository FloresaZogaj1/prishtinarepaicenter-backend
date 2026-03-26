const mongoose = require('mongoose');

const OfferSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String },
  discountType: { type: String },
  discountValue: { type: Number },
  bannerImage: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  ctaText: { type: String },
  ctaLink: { type: String },
  targetAudience: { type: String },
  active: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

OfferSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Offer', OfferSchema);
