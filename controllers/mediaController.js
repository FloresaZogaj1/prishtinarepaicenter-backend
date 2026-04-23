const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Media = require('../models/Media');

// Prepare uploads directory under project_root/public/uploads
const uploadsDir = path.join(__dirname, '..', '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // safe filename
    const safe = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, safe);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/') && !file.mimetype.startsWith('video/')) {
      return cb(new Error('Only image/video files are allowed'));
    }
    cb(null, true);
  },
}).single('file');

// Get all media (optionally filter by folder)
exports.getMedia = async (req, res) => {
  try {
    const folder = req.query.folder;
    const q = {};
    if (folder) q.folder = folder;
    const media = await Media.find(q).sort({ createdAt: -1 });
    res.json(media);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Upload media (multipart/form-data, field name 'file')
exports.uploadMedia = (req, res) => {
  upload(req, res, async function (err) {
    // Log request headers for debug (CORS, Authorization, Content-Type)
    try { console.debug('[media.upload] headers:', { authorization: req.headers.authorization, 'content-type': req.headers['content-type'] }); } catch (e) {}
    // Debug logging to help diagnose upload failures
    console.debug('[media.upload] multer err:', err && err.message);
    try {
      if (err) {
        console.error('[media.upload] upload failed:', err);
        return res.status(400).json({ error: err.message || 'Upload error' });
      }
      console.debug('[media.upload] req.file:', req.file && {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size,
      });
      console.debug('[media.upload] req.body:', req.body);

      if (!req.file) {
        console.error('[media.upload] no file present on request');
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const folder = req.body.folder || req.query.folder || 'general';
      const altText = req.body.altText || '';
      const fileUrl = `/uploads/${req.file.filename}`;

      const m = new Media({
        fileName: req.file.filename,
        fileType: req.file.mimetype,
        fileUrl,
        folder,
        altText,
        uploadedBy: req.user && req.user.id ? req.user.id : undefined,
      });
      await m.save();
      res.status(201).json(m);
    } catch (e) {
      console.error('[media.upload] unexpected error:', e);
      res.status(500).json({ error: e.message });
    }
  });
};

// Update media metadata
exports.updateMedia = async (req, res) => {
  try {
    const update = {};
    // allow updating metadata and file references so admins can replace files in-place
    if (req.body.altText !== undefined) update.altText = req.body.altText;
    if (req.body.folder !== undefined) update.folder = req.body.folder;
    if (req.body.fileUrl !== undefined) update.fileUrl = req.body.fileUrl;
    if (req.body.fileName !== undefined) update.fileName = req.body.fileName;
    if (req.body.fileType !== undefined) update.fileType = req.body.fileType;
    const media = await Media.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!media) return res.status(404).json({ error: 'Media not found' });
    res.json(media);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete media (remove DB doc and unlink file if present)
exports.deleteMedia = async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ error: 'Media not found' });
    // unlink file
    if (media.fileUrl) {
      const abs = path.join(__dirname, '..', '..', 'public', media.fileUrl);
      if (fs.existsSync(abs)) {
        try { fs.unlinkSync(abs); } catch (e) { /* ignore unlink errors */ }
      }
    }
    await Media.deleteOne({ _id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
