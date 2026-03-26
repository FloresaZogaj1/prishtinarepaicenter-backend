const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
// Load .env from the server directory explicitly so the server works regardless of cwd
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Quick debug: report whether env variables were loaded
console.debug('env MONGO_URI present:', !!process.env.MONGO_URI);
console.debug('env LOCAL_MONGO_URI present:', !!process.env.LOCAL_MONGO_URI);

const app = express();
// Allow localhost origins in development (keeps credentials: true).
// This allows any localhost port (e.g. 5173, 5176) while still disallowing
// external origins in dev. In production, set a specific origin.
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like curl, server-to-server) and allow local dev origins
    if (!origin) return callback(null, true);
    try {
      const u = new URL(origin);
      if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
        return callback(null, true);
      }
    } catch (e) {
      // ignore parse errors
    }
    // In production you might want to check process.env.NODE_ENV and only allow specific host
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());
// Cookie parser for handling HttpOnly refresh token cookies
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Connect to MongoDB using a single URI (no fallback/retry).
// Returns the actual URI used (string) on success, or throws on failure.
function maskMongoUri(uri) {
  if (!uri || typeof uri !== 'string') return uri;
  try {
    // Mask credentials between mongodb:// or mongodb+srv:// and the host
    return uri.replace(/(mongodb(?:\+srv)?:\/\/)(.*@)?(.+)/, (m, proto, creds, rest) => {
      if (creds) return `${proto}****@${rest}`;
      return `${proto}${rest}`;
    });
  } catch (e) {
    return uri;
  }
}

async function connectOnce() {
  const uri = process.env.MONGO_URI || process.env.LOCAL_MONGO_URI || 'mongodb://127.0.0.1:27017/prishtinarepaircenterdb';
  const masked = maskMongoUri(uri);
  console.log('Attempting MongoDB connection using URI:', masked);
  // Use mongoose.connect once; if it fails, throw and do NOT fallback/retry
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('MongoDB connected');
  return { uri };
}


// Routes
app.get('/', (req, res) => res.send('API Running'));

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');
const serviceRoutes = require('./routes/services');
const categoryRoutes = require('./routes/categories');
const appointmentRoutes = require('./routes/appointments');
const clientRoutes = require('./routes/clients');
const vehicleRoutes = require('./routes/vehicles');
const workOrderRoutes = require('./routes/workOrders');
const offerRoutes = require('./routes/offers');
const contentRoutes = require('./routes/content');
const settingsRoutes = require('./routes/settings');
const mediaRoutes = require('./routes/media');
const testimonialRoutes = require('./routes/testimonials');
const blogRoutes = require('./routes/blog');
const teamRoutes = require('./routes/team');
const bookingRoutes = require('./routes/bookings');
const adminBookingRoutes = require('./routes/admin/bookings');

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/work-orders', workOrderRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin/bookings', adminBookingRoutes);

// Error handler global
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
// Start server only after DB connection is established.
if (require.main === module) {
  (async () => {
    try {
      const result = await connectOnce();
      const readyState = (mongoose.connection && mongoose.connection.readyState) || 0;
      console.log('Mongoose connection readyState:', readyState);
      if (readyState !== 1) {
        console.error('Mongoose is not connected after connectOnce. Exiting.');
        process.exit(1);
      }
      // Log masked URI at startup for visibility
      console.log('MongoDB URI in use:', maskMongoUri(result.uri));
      app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
    } catch (err) {
      console.error('Failed to establish MongoDB connection. Server will not start.');
      console.error(err && err.message ? err.message : err);
      process.exit(1);
    }
  })();
}

module.exports = app;
