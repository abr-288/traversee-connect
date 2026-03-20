const prisma = require('../config/prisma');

exports.getAllPages = async (req, res) => {
    try {
        const pages = await prisma.page.findMany({ include: { sections: true } });
        res.json(pages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createPage = async (req, res) => {
    try {
        const { id, title } = req.body;
        const page = await prisma.page.create({
            data: { id, title }
        });
        res.status(201).json(page);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPageById = async (req, res) => {
    try {
        const page = await prisma.page.findUnique({ 
            where: { id: req.params.id },
            include: { sections: true }
        });
        if (!page) return res.status(404).json({ message: 'Page non trouvée' });
        res.json(page);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deletePage = async (req, res) => {
    try {
        const { id } = req.params;
        // Delete all sections first
        await prisma.section.deleteMany({ where: { pageId: id } });
        // Delete products associated if any (if pageId is used in product)
        await prisma.product.deleteMany({ where: { pageId: id } });
        // Finally delete the page
        await prisma.page.delete({ where: { id } });
        res.json({ message: "Page supprimée" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateSection = async (req, res) => {
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
};

exports.createSection = async (req, res) => {
    try {
        const { name, type, content } = req.body;
        const { pageId } = req.params;
        const section = await prisma.section.create({
            data: { name, type, content, pageId }
        });
        res.status(201).json(section);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteSection = async (req, res) => {
    try {
        await prisma.section.delete({
            where: { id: req.params.sectionId }
        });
        res.json({ message: "Section supprimée" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.seed = async (req, res) => {
    try {
        await prisma.page.upsert({ where: { id: 'index' }, update: {}, create: { id: 'index', title: 'Accueil' } });
        await prisma.page.upsert({ where: { id: 'about' }, update: {}, create: { id: 'about', title: 'À Propos' } });
        await prisma.page.upsert({ where: { id: 'solutions' }, update: {}, create: { id: 'solutions', title: 'Solutions' } });

        await prisma.section.upsert({
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

        await prisma.section.upsert({
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
};
