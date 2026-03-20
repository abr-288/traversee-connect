const prisma = require('../config/prisma');

exports.getSettings = async (req, res) => {
    try {
        let settings = await prisma.setting.findUnique({
            where: { id: 'global' }
        });
        
        if (!settings) {
            settings = await prisma.setting.create({
                data: { id: 'global' }
            });
        }
        
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const updated = await prisma.setting.update({
            where: { id: 'global' },
            data: req.body
        });
        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
