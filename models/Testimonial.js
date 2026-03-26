const mongoose = require('mongoose');

const TestimonialSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  rating: { type: Number },
  reviewText: { type: String },
  source: { type: String },
  image: { type: String },
  vehicleInfo: { type: String },
  featured: { type: Boolean, default: false },
  approved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

TestimonialSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Testimonial', TestimonialSchema);
