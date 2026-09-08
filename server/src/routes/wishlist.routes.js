import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/wishlist
router.get('/', requireAuth, async (req, res) => {
  try {
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    res.json({
      wishlist: wishlist || { items: [] },
    });
  } catch (error) {
    console.error('Failed to load wishlist:', error);

    res.status(500).json({
      error: 'Failed to load wishlist.',
    });
  }
});

// PUT /api/wishlist
router.put('/', requireAuth, async (req, res) => {
  const { items } = req.body || {};

  if (!Array.isArray(items)) {
    return res.status(400).json({
      error: 'Invalid wishlist items.',
    });
  }

  try {
    const wishlist = await prisma.wishlist.upsert({
      where: { userId: req.user.id },

      create: {
        userId: req.user.id,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
          })),
        },
      },

      update: {
        items: {
          deleteMany: {},
          create: items.map((item) => ({
            productId: item.productId,
          })),
        },
      },

      include: {
        items: true,
      },
    });

    res.json({ wishlist });
  } catch (error) {
    console.error('Failed to update wishlist:', error);

    res.status(500).json({
      error: 'Failed to update wishlist.',
    });
  }
});

export default router;