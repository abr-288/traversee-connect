const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  const users = await prisma.user.findMany();
  console.log('Liste des utilisateurs en base :');
  users.forEach(u => console.log(`- ${u.email} (Role: ${u.role})`));
  await prisma.$disconnect();
}

checkUsers();
