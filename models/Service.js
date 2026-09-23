const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  shortDescription: { type: String },
  fullDescription: { type: String },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ServiceCategory' },
  basePrice: { type: Number },
  startingPrice: { type: Number },
  durationMinutes: { type: Number },
  coverImage: { type: String },
  coverImageRemoved: { type: Boolean, default: false },
  icon: { type: String },
  processImage: { type: String },
  processImageRemoved: { type: Boolean, default: false },
  video: {
    src: { type: String },
    poster: { type: String },
    removed: { type: Boolean, default: false }
  },
  features: { type: Array },
  processSteps: { type: Array },
  ctaText: { type: String },
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  seoTitle: { type: String },
  seoDescription: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ServiceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Service', ServiceSchema);
