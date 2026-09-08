import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PRODUCTS, CATEGORIES } from '../../src/data/products.js';

const prisma = new PrismaClient();

async function main() {
  console.log(`Seeding ${CATEGORIES.length} categories...`);

  for (const category of CATEGORIES) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {
        label: category.label,
        icon: category.icon,
        hue: category.hue,
        tagline: category.tagline || null,
        image: category.image || null,
      },
      create: {
        id: category.id,
        label: category.label,
        icon: category.icon,
        hue: category.hue,
        tagline: category.tagline || null,
        image: category.image || null,
      },
    });
  }

  console.log(`Seeding ${PRODUCTS.length} products...`);

  for (const p of PRODUCTS) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        category: p.category,
        sub: p.sub || null,
        name: p.name,
        price: p.price,
        rating: p.rating,
        reviews: p.reviews,
        image: p.image,
        icon: p.icon,
        hue: p.hue,
      },
      create: {
        id: p.id,
        category: p.category,
        sub: p.sub || null,
        name: p.name,
        price: p.price,
        rating: p.rating,
        reviews: p.reviews,
        image: p.image,
        icon: p.icon,
        hue: p.hue,
      },
    });
  }

  console.log('Done.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });