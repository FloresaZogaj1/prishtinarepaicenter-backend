const ContentSection = require('../models/ContentSection');

// Get all content sections
exports.getContent = async (req, res) => {
  try {
    const content = await ContentSection.find();
    res.json(content);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get content section by sectionKey
exports.getContentBySectionKey = async (req, res) => {
  try {
    const section = await ContentSection.findOne({ sectionKey: req.params.sectionKey });
    if (!section) return res.status(404).json({ error: 'Section not found' });
    res.json(section);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update content section by sectionKey
exports.updateContentBySectionKey = async (req, res) => {
  try {
    const section = await ContentSection.findOneAndUpdate(
      { sectionKey: req.params.sectionKey },
      req.body,
      { new: true }
    );
    if (!section) return res.status(404).json({ error: 'Section not found' });
    res.json(section);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
