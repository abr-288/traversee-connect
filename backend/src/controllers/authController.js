const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET || 'access_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';

const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { id: user.id, email: user.email, role: user.role }, 
        ACCESS_TOKEN_SECRET, 
        { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
        { id: user.id }, 
        REFRESH_TOKEN_SECRET, 
        { expiresIn: '7d' }
    );
    return { accessToken, refreshToken };
};

exports.register = async (req, res) => {
    let { email, password, name, phone, company } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email et mot de passe requis' });
    
    email = email.trim().toLowerCase();
    
    try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ message: 'Email déjà utilisé' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword, name, phone, company }
        });
        
        const { accessToken, refreshToken } = generateTokens(user);
        
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({ token: accessToken, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    let { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email et mot de passe requis' });

    email = email.trim().toLowerCase();
    console.log('Tentative de connexion pour :', email);

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log('Utilisateur non trouvé:', email);
            return res.status(400).json({ message: 'Identifiants invalides' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Identifiants invalides' });

        const { accessToken, refreshToken } = generateTokens(user);

        // Add login log
        await prisma.loginLog.create({
            data: {
                userId: user.id,
                ip: req.ip,
                device: req.headers['user-agent']
            }
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({ token: accessToken, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.refresh = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token non trouvé' });

    try {
        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) return res.status(401).json({ message: 'Utilisateur non trouvé' });

        const { accessToken, refreshToken: newRefreshToken } = generateTokens(user);

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.json({ token: accessToken, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (error) {
        res.status(401).json({ message: 'Refresh token invalide' });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.json({ message: 'Déconnexion réussie' });
};

exports.getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
        res.json({ id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, company: user.company, address: user.address, avatar: user.avatar });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    const { name, phone, company, address, password } = req.body;
    try {
        const data = { name, phone, company, address };
        if (password && password.trim() !== '') {
            data.password = await bcrypt.hash(password, 10);
        }

        const updated = await prisma.user.update({
            where: { id: req.user.id },
            data,
            select: { id: true, email: true, name: true, role: true, phone: true, company: true, address: true }
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
