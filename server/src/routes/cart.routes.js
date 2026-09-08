import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// GET /api/cart
router.get('/', requireAuth, async (req, res) => {
    const cart = await prisma.cart.findUnique({
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
        cart: cart || { items: [] },
    });
});

// PUT /api/cart
router.put('/', requireAuth, async (req, res) => {
    const { items } = req.body || {};

    if (!Array.isArray(items)) {
        return res.status(400).json({ error: 'Invalid cart items.' });
    }

    try {
        const cart = await prisma.cart.upsert({
            where: { userId: req.user.id },

            create: {
                userId: req.user.id,
                items: {
                    create: items.map((item) => ({
                        productId: item.productId,
                        qty: Number(item.qty),
                    })),
                },
            },

            update: {
                items: {
                    deleteMany: {},
                    create: items.map((item) => ({
                        productId: item.productId,
                        qty: Number(item.qty),
                    })),
                },
            },

            include: {
                items: true,
            },
        });

        res.json({ cart });
    } catch (error) {
        console.error('Failed to update cart:', error);

        res.status(500).json({
            error: 'Failed to update cart.',
        });
    }
});

export default router;