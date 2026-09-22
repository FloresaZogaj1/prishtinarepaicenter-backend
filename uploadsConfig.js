const path = require('path');
const fs = require('fs');

// Centralized uploads directory configuration
// Default to project-local public/uploads for development when UPLOADS_DIR is not set.
const uploadsDir = process.env.UPLOADS_DIR && String(process.env.UPLOADS_DIR).trim()
  ? path.resolve(String(process.env.UPLOADS_DIR))
  : path.join(__dirname, '..', 'public', 'uploads');

// Ensure the directory exists at startup (idempotent)
try {
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
} catch (e) {
  // If creation fails, let callers handle errors; keep startup resilient.
  console.error('[uploadsConfig] failed to ensure uploadsDir exists:', uploadsDir, e && e.message);
}

module.exports = { uploadsDir };
