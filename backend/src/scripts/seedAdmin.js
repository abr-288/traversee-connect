const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function seedAdmin() {
    const email = 'admin@onesky.com';
    const password = 'Admin@2026!';
    const name = 'Admin OneSky';

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                password: hashedPassword,
                role: 'ADMIN',
                name: name
            },
            create: {
                email,
                password: hashedPassword,
                name: name,
                role: 'ADMIN'
            }
        });

        console.log('✅ Utilisateur Admin créé ou mis à jour avec succès :');
        console.log(`📧 Email : ${user.email}`);
        console.log(`🔑 Mot de passe : ${password}`);
    } catch (error) {
        console.error('❌ Erreur lors du seeding de l\'admin :', error);
    } finally {
        await prisma.$disconnect();
    }
}

seedAdmin();
