import { PrismaClient, TransactionType } from '@prisma/client';

const prisma = new PrismaClient();

export const DEFAULT_CATEGORIES = [
  // Expense Categories
  {
    slug: 'housing',
    name: 'Housing',
    icon: 'home-outline',
    color: '#4A6CF7',
    type: TransactionType.EXPENSE,
    isDefault: true,
  },
  {
    slug: 'food',
    name: 'Food & Dining',
    icon: 'restaurant-outline',
    color: '#FF5722',
    type: TransactionType.EXPENSE,
    isDefault: true,
  },
  {
    slug: 'transportation',
    name: 'Transportation',
    icon: 'car-outline',
    color: '#FF9800',
    type: TransactionType.EXPENSE,
    isDefault: true,
  },
  {
    slug: 'utilities',
    name: 'Utilities & Bills',
    icon: 'flash-outline',
    color: '#FFC107',
    type: TransactionType.EXPENSE,
    isDefault: true,
  },
  {
    slug: 'entertainment',
    name: 'Entertainment',
    icon: 'film-outline',
    color: '#9C27B0',
    type: TransactionType.EXPENSE,
    isDefault: true,
  },
  {
    slug: 'healthcare',
    name: 'Healthcare',
    icon: 'medkit-outline',
    color: '#E91E63',
    type: TransactionType.EXPENSE,
    isDefault: true,
  },
  {
    slug: 'shopping',
    name: 'Shopping',
    icon: 'cart-outline',
    color: '#00BCD4',
    type: TransactionType.EXPENSE,
    isDefault: true,
  },
  // Income Categories
  {
    slug: 'salary',
    name: 'Salary',
    icon: 'cash-outline',
    color: '#4CAF50',
    type: TransactionType.INCOME,
    isDefault: true,
  },
  {
    slug: 'freelance',
    name: 'Freelance',
    icon: 'briefcase-outline',
    color: '#8BC34A',
    type: TransactionType.INCOME,
    isDefault: true,
  },
  {
    slug: 'investment',
    name: 'Investment',
    icon: 'trending-up-outline',
    color: '#009688',
    type: TransactionType.INCOME,
    isDefault: true,
  },
  // Shared / Other
  {
    slug: 'other',
    name: 'Other',
    icon: 'ellipsis-horizontal-outline',
    color: '#607D8B',
    type: TransactionType.EXPENSE,
    isDefault: true,
  },
];

export async function main() {
  console.log('🌱 Starting category seeding...');

  for (const category of DEFAULT_CATEGORIES) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        icon: category.icon,
        color: category.color,
        type: category.type,
        isDefault: category.isDefault,
      },
      create: {
        slug: category.slug,
        name: category.name,
        icon: category.icon,
        color: category.color,
        type: category.type,
        isDefault: category.isDefault,
      },
    });
    console.log(`  ✓ Synced category: ${record.name} (${record.type})`);
  }

  console.log(`✅ Successfully seeded ${DEFAULT_CATEGORIES.length} default categories!`);
}

if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Seeding failed:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
