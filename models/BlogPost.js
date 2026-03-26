const mongoose = require('mongoose');

const BlogPostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: { type: String },
  content: { type: String },
  featuredImage: { type: String },
  category: { type: String },
  tags: [{ type: String }],
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
  status: { type: String, default: 'Draft' },
  publishDate: { type: Date },
  seoTitle: { type: String },
  seoDescription: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

BlogPostSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('BlogPost', BlogPostSchema);
