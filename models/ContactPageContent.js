const mongoose = require('mongoose');

const ContactPageContentSchema = new mongoose.Schema({
  title: { type: String },
  subtitle: { type: String },
  address: { type: String },
  phoneDisplay: { type: String },
  phoneIntl: { type: String },
  email: { type: String },
  maps: { type: String },
  updatedAt: { type: Date, default: Date.now },
});

ContactPageContentSchema.pre('save', function (next) { this.updatedAt = Date.now(); next(); });

module.exports = mongoose.model('ContactPageContent', ContactPageContentSchema);
