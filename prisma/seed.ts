import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  const hashedPassword = await bcrypt.hash(process.env.TEST_PASSWORD || 'TestPassword123', 12);

  const userData = [
    {
      email: 'admin@example.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
    },
    {
      email: 'user@example.com',
      name: 'Regular User',
      role: UserRole.USER,
    },
  ];

  const users = await Promise.all(
    userData.map(user => 
      prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: {
          ...user,
          passwordHash: hashedPassword,
        },
      })
    )
  );

  const [adminUser, regularUser] = users;
  console.log('Users created:', { adminUser: adminUser.email, regularUser: regularUser.email });

  const articleData = [
    {
      id: '2d576507-a6ec-4b93-abca-cc325fce48fa',
      title: 'Public Article 1',
      content: 'This is a public article that everyone can read.',
      tags: ['welcome', 'public', 'introduction'],
      isPublic: true,
      authorId: adminUser.id,
    },
    {
      id: '0483e848-1257-44e9-925c-8717de6a57b7',
      title: 'Private Article 1',
      content: 'This is a private article that only authenticated users can access.',
      tags: ['documentation', 'private', 'internal'],
      isPublic: false,
      authorId: adminUser.id,
    },
    {
      id: '39c19af0-bf81-431c-8c28-eed6befe0c26',
      title: 'Public Article 2',
      content: 'This is another public article that everyone can read.',
      tags: ['guide', 'public', 'help'],
      isPublic: true,
      authorId: regularUser.id,
    },
  ];

  const articles = await Promise.all(
    articleData.map(article =>
      prisma.article.upsert({
        where: { id: article.id },
        update: {},
        create: article,
      })
    )
  );

  console.log('Articles created:', articles.length);

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
