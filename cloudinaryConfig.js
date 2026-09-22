const cloudinary = require('cloudinary').v2;

// Configure Cloudinary only from environment variables. If required envs
// are not present, export a disabled wrapper so callers can fall back.
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

let enabled = false;
try {
  if (CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET) {
    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
      secure: true,
    });
    enabled = true;
  }
} catch (e) {
  console.error('[cloudinaryConfig] failed to configure Cloudinary:', e && e.message);
}

module.exports = { cloudinary, enabled };
