const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

app.use(cors());
app.use(express.json());

// --- AUTH MIDDLEWARE ---
const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Accès refusé. Token manquant.' });
    
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token invalide' });
    }
};

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
    const { email, password, name } = req.body;
    try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ message: 'Email déjà utilisé' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword, name }
        });
        
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ message: 'Identifiants invalides' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Identifiants invalides' });

        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
        res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- PAGES ---
app.get('/api/pages', requireAuth, async (req, res) => {
    const pages = await prisma.page.findMany({ include: { sections: true } });
    res.json(pages);
});

app.get('/api/pages/:id', requireAuth, async (req, res) => {
    const page = await prisma.page.findUnique({ 
        where: { id: req.params.id },
        include: { sections: true }
    });
    if (!page) return res.status(404).json({ message: 'Page non trouvée' });
    res.json(page);
});

app.put('/api/pages/:pageId/sections/:sectionId', requireAuth, async (req, res) => {
    try {
        const { content } = req.body;
        const section = await prisma.section.update({
            where: { id: req.params.sectionId },
            data: { content }
        });
        res.json(section);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- SEED ---
app.post('/api/seed', async (req, res) => {
    try {
        await prisma.page.upsert({ where: { id: 'index' }, update: {}, create: { id: 'index', title: 'Accueil' } });
        await prisma.page.upsert({ where: { id: 'about' }, update: {}, create: { id: 'about', title: 'À Propos' } });
        await prisma.page.upsert({ where: { id: 'solutions' }, update: {}, create: { id: 'solutions', title: 'Solutions' } });

        const heroSection = await prisma.section.upsert({
            where: { pageId_name: { pageId: 'index', name: 'Héro Section' } },
            update: {},
            create: {
                id: 'hero',
                name: 'Héro Section',
                type: 'hero',
                pageId: 'index',
                content: {
                    tagline: "Connectez-vous au monde avec les satellites",
                    description: "ONE SKY opère une constellation de satellites pour fournir des données.",
                    ctaText: "Découvrir nos solutions",
                    videoUrl: "https://res.cloudinary.com/dla8r1gxi/video/upload/v1769787946/banner_zzz79v.mp4"
                }
            }
        });

        const servicesSection = await prisma.section.upsert({
            where: { pageId_name: { pageId: 'index', name: 'Services Section' } },
            update: {},
            create: {
                id: 'services',
                name: 'Services Section',
                type: 'services',
                pageId: 'index',
                content: {
                    title: "Des solutions de pointe pour l'économie spatiale",
                    subtitle: "Notre Expertise",
                    description: "ONE SKY intègre l'ensemble de la chaîne de valeur."
                }
            }
        });

        res.json({ message: 'Seed terminé !' });
    } catch (error) {
         res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
