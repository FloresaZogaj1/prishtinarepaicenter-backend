const mongoose = require('mongoose');

const ContentSectionSchema = new mongoose.Schema({
  sectionKey: { type: String, required: true, unique: true },
  title: { type: String },
  subtitle: { type: String },
  body: { type: String },
  buttonText: { type: String },
  buttonLink: { type: String },
  media: { type: String },
  active: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  seoTitle: { type: String },
  seoDescription: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ContentSectionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ContentSection', ContentSectionSchema);
