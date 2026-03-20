const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const pageRoutes = require('./routes/pageRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const messageRoutes = require('./routes/messageRoutes');
const settingRoutes = require('./routes/settingRoutes');
const emailRoutes = require('./routes/emailRoutes');
const portalRoutes = require('./routes/portalRoutes');
const adminPortalRoutes = require('./routes/adminPortalRoutes');
const cookieParser = require('cookie-parser');

const app = express();

app.use(morgan('dev'));

// CORS (dev-friendly)
// - Le frontend peut tourner sur 5173, 5174, etc.
// - En prod, on peut basculer sur une liste explicite via CORS_ORIGINS.
const corsOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173,http://localhost:5174")
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Certaines requêtes (ou certains clients) peuvent ne pas envoyer d'Origin.
    if (!origin) return callback(null, true);

    if (corsOrigins.includes(origin)) return callback(null, true);

    // En dev, autoriser n'importe quel port local pour éviter les blocages.
    if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin non autorisée par CORS: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// Main Routes
app.use('/api/auth', authRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/portal', portalRoutes);
app.use('/api/admin-portal', adminPortalRoutes);

// Base Route
app.get('/', (req, res) => {
    res.json({ message: "Bienvenue sur l'API ONESKY" });
});

module.exports = app;
