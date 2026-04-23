const mongoose = require('mongoose');

const WorkItem = {
  src: { type: String },
  title: { type: String },
  thumbnail: { type: String },
};

const PunetTonaPageContentSchema = new mongoose.Schema({
  works: { type: [WorkItem], default: [] },
  updatedAt: { type: Date, default: Date.now },
});

PunetTonaPageContentSchema.pre('save', function(next) { this.updatedAt = Date.now(); next(); });

module.exports = mongoose.model('PunetTonaPageContent', PunetTonaPageContentSchema);
