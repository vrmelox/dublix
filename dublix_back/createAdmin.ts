
// createAdmin.ts
import { PrismaClient, RoleType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('12345678', 10);

  await prisma.utilisateur.create({
    data: {
      nom: 'Admin',
      prenom: 'Principal',
      email: 'akandeabiodoun@mail.com',
      motDePasse: hashedPassword,
      role: RoleType.ADMINISTRATEUR,
    },
  });

  console.log('Utilisateur administrateur créé');
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  prisma.$disconnect();
});
