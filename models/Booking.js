const mongoose = require('mongoose');

// Lightweight Booking schema used by public booking form
const BookingSchema = new mongoose.Schema({
  name: { type: String },
  phone: { type: String },
  serviceName: { type: String },
  date: { type: Date },
  time: { type: String }, // optional time field (HH:mm or free text)
  status: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// keep updatedAt in sync
BookingSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Booking', BookingSchema);
