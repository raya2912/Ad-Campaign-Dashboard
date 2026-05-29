import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding mock data...');

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  const advertiser = await prisma.user.upsert({
    where: { email: 'advertiser@example.com' },
    update: {},
    create: {
      email: 'advertiser@example.com',
      name: 'Demo Advertiser',
      password: userPassword,
      role: 'ADVERTISER',
    },
  });

  // Create campaigns
  const statuses = ['ACTIVE', 'PAUSED', 'COMPLETED', 'DRAFT'];
  const campaignsData = Array.from({ length: 15 }).map((_, i) => ({
    name: `Campaign Q${(i % 4) + 1} 202${3 + (i % 2)}`,
    budget: Math.floor(Math.random() * 10000) + 1000,
    status: statuses[Math.floor(Math.random() * statuses.length)] as any,
    startDate: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
    userId: advertiser.id,
  }));

  for (const c of campaignsData) {
    const campaign = await prisma.campaign.create({
      data: c,
    });

    // Create metrics
    const impressions = Math.floor(Math.random() * 100000) + 5000;
    const clicks = Math.floor(impressions * (Math.random() * 0.05 + 0.01)); // 1-6% CTR
    const spend = clicks * (Math.random() * 2 + 0.5); // $0.5 - $2.5 CPC
    const conversions = Math.floor(clicks * (Math.random() * 0.1 + 0.02)); // 2-12% CVR
    const revenue = conversions * (Math.random() * 50 + 20); // $20 - $70 per conversion

    await prisma.metric.create({
      data: {
        campaignId: campaign.id,
        impressions,
        clicks,
        spend,
        conversions,
        revenue,
      },
    });

    // Create AI Insight
    if (Math.random() > 0.5) {
      const types = ['ALERT', 'RECOMMENDATION', 'TREND'];
      const messages = [
        'Consider increasing budget by 15% due to high CTR.',
        'Mobile impressions dropped this week.',
        'High conversion rate observed for Age 18-24 demographic.',
      ];
      await prisma.aIInsight.create({
        data: {
          campaignId: campaign.id,
          type: types[Math.floor(Math.random() * types.length)],
          message: messages[Math.floor(Math.random() * messages.length)],
        },
      });
    }
  }

  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
