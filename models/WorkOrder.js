const mongoose = require('mongoose');

const WorkOrderSchema = new mongoose.Schema({
  workOrderNumber: { type: String, required: true, unique: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  reportedIssue: { type: String },
  initialInspection: { type: String },
  diagnosis: { type: String },
  requiredParts: [{ type: String }],
  laborHours: { type: Number },
  assignedTechnicianId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  estimatedCost: { type: Number },
  approvedByClient: { type: Boolean, default: false },
  approvalDate: { type: Date },
  status: { type: String, default: 'Open' },
  beforeImages: [{ type: String }],
  afterImages: [{ type: String }],
  internalNotes: { type: String },
  finalCost: { type: Number },
  paymentStatus: { type: String, default: 'Unpaid' },
  startedAt: { type: Date },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

WorkOrderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('WorkOrder', WorkOrderSchema);
