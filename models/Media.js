const mongoose = require('mongoose');

const MediaSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileType: { type: String },
  fileUrl: { type: String },
  folder: { type: String },
  tags: [{ type: String }],
  altText: { type: String },
  uploadedBy: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

MediaSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Media', MediaSchema);
