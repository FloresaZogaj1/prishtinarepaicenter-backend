const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String },
  email: { type: String },
  address: { type: String },
  notes: { type: String },
  tags: [{ type: String }],
  preferredContactMethod: { type: String },
  reminderEnabled: { type: Boolean, default: false },
  history: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

ClientSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Client', ClientSchema);
