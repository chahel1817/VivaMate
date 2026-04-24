const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  author: { type: String, required: true },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const postSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: String, required: true },
  category: { type: String, default: "General" },
  comments: [commentSchema],
  date: { type: Date, default: Date.now }
});

postSchema.index({ category: 1 });
postSchema.index({ date: -1 });

module.exports = mongoose.model('Post', postSchema);
