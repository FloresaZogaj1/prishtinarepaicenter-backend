
const express = require('express');
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const { postValidation, validate } = require('../middleware/validation');
const router = express.Router();


// Create
router.post('/', auth, postValidation, validate, async (req, res, next) => {
  try {
    const post = new Post(req.body);
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
});


// Read all
router.get('/', async (req, res, next) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (err) {
    next(err);
  }
});


// Update
router.put('/:id', auth, postValidation, validate, async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!post) return res.status(404).json({ error: 'Postimi nuk u gjet!' });
    res.json(post);
  } catch (err) {
    next(err);
  }
});


// Delete
router.delete('/:id', auth, async (req, res, next) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ error: 'Postimi nuk u gjet!' });
    res.json({ message: 'U fshi me sukses!' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
