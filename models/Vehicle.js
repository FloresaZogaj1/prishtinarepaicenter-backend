const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  brand: { type: String },
  model: { type: String },
  year: { type: Number },
  engine: { type: String },
  fuelType: { type: String },
  transmission: { type: String },
  plateNumber: { type: String },
  vin: { type: String },
  mileage: { type: Number },
  color: { type: String },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

VehicleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
