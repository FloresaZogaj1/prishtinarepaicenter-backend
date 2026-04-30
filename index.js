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
// Configure allowed origins. By default we explicitly allow your production
// domains and common local dev origins. You may override via the
// ALLOWED_ORIGINS environment variable (comma-separated list of origins,
// e.g. "https://domena.com,https://www.domena.com").
// Default includes the two Netlify frontends (with and without www) and
// common Vite/CRA dev hosts used locally.
const DEFAULT_ALLOWED = [
  'http://localhost:5173',
  'http://localhost:3000',
  // Production frontend origins - keep these in-sync with .env.example
  'https://prishtinarepaircenter.com',
  'https://www.prishtinarepaircenter.com'
];
const allowedOrigins = (process.env.ALLOWED_ORIGINS && String(process.env.ALLOWED_ORIGINS).trim())
  ? String(process.env.ALLOWED_ORIGINS).split(',').map(s => s.trim()).filter(Boolean)
  : DEFAULT_ALLOWED;

console.debug('CORS allowed origins:', allowedOrigins);

// When running behind a proxy (Render, Heroku, etc.) express should trust
// the first proxy so secure cookies and correct IPs work. Enable by setting
// TRUST_PROXY=1 in the environment or automatically in production.
const enableTrustProxy = process.env.TRUST_PROXY === '1' || process.env.NODE_ENV === 'production';
if (enableTrustProxy) {
  // use numeric value 1 as recommended by Express docs (trust first proxy)
  app.set('trust proxy', 1);
  console.debug('express trust proxy set to 1');
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server requests or tools without origin
    if (!origin) return callback(null, true);
    try {
      const u = new URL(origin);
      const hostname = u.hostname || '';
      // Allow localhost dev origins
      if (hostname === 'localhost' || hostname === '127.0.0.1') return callback(null, true);
      // Allow exact matches against configured allowed origins
      if (allowedOrigins.includes(origin)) return callback(null, true);
    } catch (e) {
      // ignore parse errors
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  // expose headers if needed
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Origin'],
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS']
}));
app.use(express.json());
// Cookie parser for handling HttpOnly refresh token cookies
const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Serve uploaded media files (public/uploads)
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

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
const siteContentRoutes = require('./routes/siteContent');
const bannerRoutes = require('./routes/banners');
const testimonialRoutes = require('./routes/testimonials');
const blogRoutes = require('./routes/blog');
const teamRoutes = require('./routes/team');
const pagesHomeRoute = require('./routes/pages/home');
const pagesAboutRoute = require('./routes/pages/about');
const pagesServicesRoute = require('./routes/pages/services');
const pagesDiagnostikeRoute = require('./routes/pages/diagnostikeKompjuterike');
const pagesPunetTonaRoute = require('./routes/pages/punetTona');
const pagesContactRoute = require('./routes/pages/contact');
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
app.use('/api/site-content', siteContentRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/pages/home', pagesHomeRoute);
app.use('/api/pages/about', pagesAboutRoute);
app.use('/api/pages/services', pagesServicesRoute);
app.use('/api/pages/DiagnostikeKompjuterike', pagesDiagnostikeRoute);
app.use('/api/pages/punetTona', pagesPunetTonaRoute);
app.use('/api/pages/contact', pagesContactRoute);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin/bookings', adminBookingRoutes);

// Error handler global
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5511; // temporarily use 5511 as default for diagnostics/test
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
      // Try to bind to 127.0.0.1 explicitly so local IPv4 requests (127.0.0.1) reliably connect.
      // If that doesn't produce a reachable listener, fall back to binding to 0.0.0.0.
  // Bind to 0.0.0.0 so the server accepts connections on all interfaces (avoids localhost-only restrictions)
  const server = app.listen(PORT, '0.0.0.0');
      server.on('listening', () => {
        try {
          const addr = server.address();
          console.log(`Server started on ${addr.address}:${addr.port}`);
        } catch (e) {
          console.log(`Server started on port ${PORT}`);
        }
      });
      server.on('error', (err) => {
        console.error('Server listen error on 127.0.0.1:', err && err.message ? err.message : err);
        // If binding to 0.0.0.0 failed (unlikely), try a simple listen without explicit host
        try {
          const fb = app.listen(PORT, () => {
            const a = fb.address();
            console.log(`Server started on ${a.address}:${a.port} (fallback)`);
          });
          fb.on('error', (e) => console.error('Fallback listen error:', e && e.message ? e.message : e));
        } catch (e) {
          console.error('Fallback listen exception:', e && e.message ? e.message : e);
        }
      });
      // Diagnostic: if we reach here and no listener is reachable, try a different port to see if binds behave differently.
      const diagPort = process.env.DIAG_PORT || 5512;
      setTimeout(() => {
        const diagServer = app.listen(diagPort, '127.0.0.1');
        diagServer.on('listening', () => {
          try { const addr = diagServer.address(); console.log(`Diagnostic listener started on ${addr.address}:${addr.port}`); } catch (e) { console.log(`Diagnostic listener started on port ${diagPort}`); }
          diagServer.close();
        });
        diagServer.on('error', (e) => console.error('Diagnostic listen error:', e && e.message ? e.message : e));
      }, 1000);
    } catch (err) {
      console.error('Failed to establish MongoDB connection.');
      console.error(err && err.message ? err.message : err);
      // In development mode, try to start an in-memory MongoDB so the server can run for local dev/test
      if (process.env.NODE_ENV !== 'production') {
        try {
          console.log('Attempting to start an in-memory MongoDB for development (mongodb-memory-server)...');
          // require here to avoid adding it to production bundles accidentally
          const { MongoMemoryServer } = require('mongodb-memory-server');
          const mongod = await MongoMemoryServer.create();
          const memUri = mongod.getUri();
          console.log('In-memory MongoDB URI:', memUri);
          await mongoose.connect(memUri, { useNewUrlParser: true, useUnifiedTopology: true });
          console.log('Connected to in-memory MongoDB (development fallback)');
          // Start server
          app.listen(PORT, () => console.log(`Server started on port ${PORT} (with in-memory MongoDB)`));
          // Ensure the in-memory server is stopped on process exit
          const stopHandler = async () => {
            try { await mongod.stop(); } catch (e) { /* ignore */ }
            process.exit(0);
          };
          process.on('SIGINT', stopHandler);
          process.on('SIGTERM', stopHandler);
          process.on('exit', stopHandler);
          return;
        } catch (memErr) {
          console.error('Failed to start in-memory MongoDB fallback:', memErr && memErr.message ? memErr.message : memErr);
        }
      }
      console.error('Server will not start. Set a reachable MongoDB URI or enable development fallback.');
      process.exit(1);
    }
  })();
}

module.exports = app;
