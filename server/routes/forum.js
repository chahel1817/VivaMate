const express = require('express');
const router = express.Router();
const Post = require('../models/Forum');
const protect = require('../src/middleware/authMiddleware');

// Get all posts
router.get('/', protect, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a new post
router.post('/', protect, async (req, res) => {
  console.log('Received post request:', req.body); // Add logging
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    author: req.body.author
  });
  try {
    const newPost = await post.save();
    console.log('Post saved:', newPost); // Add logging
    res.status(201).json(newPost);
  } catch (err) {
    console.error('Error saving post:', err); // Add logging
    res.status(400).json({ message: err.message });
  }
});

// Add a comment to a post
router.post('/:id/comment', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.comments.push({
      author: req.body.author,
      text: req.body.text
    });

    const updatedPost = await post.save();
    res.json(updatedPost);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
