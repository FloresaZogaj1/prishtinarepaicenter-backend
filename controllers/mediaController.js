const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Media = require('../models/Media');
const { cloudinary, enabled: cloudinaryEnabled } = require('../cloudinaryConfig');

// Centralized uploads directory (configurable via UPLOADS_DIR env)
const { uploadsDir } = require('../uploadsConfig');

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

// Allow up to 50MB to support video uploads; images remain acceptable as before.
const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
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
    // Log request headers for debug: DO NOT print Authorization header value
    try {
      console.debug('[media.upload] headers:', { authorizationPresent: !!req.headers.authorization, 'content-type': req.headers['content-type'] });
    } catch (e) {}
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
  // Avoid logging full request bodies to prevent accidental leakage of secrets
  try { console.debug('[media.upload] body keys:', Object.keys(req.body || {})); } catch (e) {}

      if (!req.file) {
        console.error('[media.upload] no file present on request');
        return res.status(400).json({ error: 'No file uploaded' });
      }

        const folder = req.body.folder || req.query.folder || 'general';
        const altText = req.body.altText || '';

        // Default to local file URL
        let fileUrl = `/uploads/${req.file.filename}`;
        let cloudinaryPublicId = undefined;

        // If Cloudinary is configured, upload to Cloudinary and remove local temp file.
        // On Cloudinary upload failure when enabled, do NOT fall back to local storage
        // (production safety): remove temp file and return HTTP 500.
        if (cloudinaryEnabled) {
          try {
            const clFolder = `prishtina-repair-center/${folder}`;
            const result = await cloudinary.uploader.upload(path.join(uploadsDir, req.file.filename), { folder: clFolder, resource_type: 'auto' });
            if (result && result.secure_url) {
              fileUrl = result.secure_url;
              cloudinaryPublicId = result.public_id;
            } else {
              // Unexpected: treat as failure
              throw new Error('Cloudinary returned no secure_url');
            }
          } catch (e) {
            console.error('[media.upload] Cloudinary upload failed:', e && e.message);
            // Remove temporary local file (best-effort)
            try {
              const abs = path.join(uploadsDir, req.file.filename);
              if (fs.existsSync(abs)) fs.unlinkSync(abs);
            } catch (ux) {
              console.error('[media.upload] failed to remove temp file after cloudinary failure:', ux && ux.message);
            }
            // Return error to caller; do NOT create a Media record pointing at ephemeral local storage
            return res.status(500).json({ error: 'Cloudinary upload failed' });
          }
          // Remove temporary local file after successful Cloudinary upload (best-effort)
          try {
            const abs2 = path.join(uploadsDir, req.file.filename);
            if (fs.existsSync(abs2)) fs.unlinkSync(abs2);
          } catch (e) {
            console.error('[media.upload] failed to remove temp file after cloudinary success:', e && e.message);
          }
        }

        const m = new Media({
          fileName: req.file.filename,
          fileType: req.file.mimetype,
          fileUrl,
          folder,
          altText,
          uploadedBy: req.user && req.user.id ? req.user.id : undefined,
          cloudinaryPublicId,
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
    // If media has a Cloudinary public id and Cloudinary configured, delete it first
    if (media.cloudinaryPublicId && cloudinaryEnabled) {
      try {
        await cloudinary.uploader.destroy(media.cloudinaryPublicId);
      } catch (e) {
        console.error('[media.delete] cloudinary destroy failed:', e && e.message);
        // continue to attempt local unlink / DB deletion
      }
    }
    // unlink local file if present (fallback for legacy /uploads files)
    if (media.fileUrl) {
      try {
        const abs = path.join(uploadsDir, path.basename(media.fileUrl || ''));
        if (fs.existsSync(abs)) {
          try { fs.unlinkSync(abs); } catch (e) { /* ignore unlink errors */ }
        }
      } catch (e) { /* ignore */ }
    }
    await Media.deleteOne({ _id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
