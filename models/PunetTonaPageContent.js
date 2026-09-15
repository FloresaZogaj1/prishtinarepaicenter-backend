const mongoose = require('mongoose');

// Define a proper subdocument schema for works where _id is explicitly a String
const WorkItemSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    src: { type: String },
    title: { type: String },
    thumbnail: { type: String },
  },
  { _id: false }
);

const PunetTonaPageContentSchema = new mongoose.Schema({
  works: { type: [WorkItemSchema], default: [] },
  updatedAt: { type: Date, default: Date.now },
});

PunetTonaPageContentSchema.pre('save', function(next) { this.updatedAt = Date.now(); next(); });

module.exports = mongoose.model('PunetTonaPageContent', PunetTonaPageContentSchema);
