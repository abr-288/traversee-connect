const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    let token;

    // Standard auth header (normal REST requests)
    if (authHeader) {
        token = authHeader.split(' ')[1];
    } else {
        // SSE/EventSource can't set Authorization headers; allow token via query string.
        // Expected usage: /api/.../stream?token=...
        const queryToken = req.query && req.query.token;
        token = Array.isArray(queryToken) ? queryToken[0] : queryToken;
    }

    if (!token) return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token invalide' });
    }
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ message: 'Accès interdit. Rôle administrateur requis.' });
    }
};

module.exports = { requireAuth, isAdmin };
