const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
  fullName: { type: String },
  phone: { type: String },
  email: { type: String },
  vehicleBrand: { type: String },
  vehicleModel: { type: String },
  vehicleYear: { type: Number },
  plateNumber: { type: String },
  mileage: { type: Number },
  serviceName: { type: String },
  preferredDate: { type: String },
  preferredTime: { type: String },
  issueDescription: { type: String },
  status: { type: String, default: 'New' },
  priority: { type: String, default: 'Medium' },
  leadSource: { type: String },
  assignedStaff: { type: String },
  notesInternal: { type: String },
  attachments: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

AppointmentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Appointment', AppointmentSchema);
