const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

exports.createUser = async (req, res) => {
    const { email, password, name, role } = req.body;
    try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ message: 'Email déjà utilisé' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword, name, role: role || 'USER' }
        });
        
        res.status(201).json({ id: user.id, email: user.email, name: user.name, role: user.role });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true
            }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    try {
        const updatedUser = await prisma.user.update({
            where: { id },
            data: { role },
            select: {
                id: true,
                email: true,
                name: true,
                role: true
            }
        });
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { email, password, name, role } = req.body;
    try {
        const data = { email, name, role };
        
        if (password && password.trim() !== "") {
            data.password = await bcrypt.hash(password, 10);
        } else {
            // If password is empty string, don't update it
            delete data.password;
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                email: true,
                name: true,
                role: true
            }
        });
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.user.delete({ where: { id } });
        res.json({ message: 'Utilisateur supprimé' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
