import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Get all categories
router.get('/', async (_req, res, next) => {
    try {
        const categories = await prisma.category.findMany({
            orderBy: {
                id: 'asc',
            },
        });

        res.json({ categories });
    } catch (error) {
        next(error);
    }
});

// Create category
router.post('/', requireAuth, requireAdmin, async (req, res, next) => {
    try {
        const {
            id,
            label,
            icon,
            hue,
            tagline,
            image,
        } = req.body;

        if (!id?.trim() || !label?.trim()) {
            return res.status(400).json({
                error: 'Category ID and label are required.',
            });
        }

        const category = await prisma.category.create({
            data: {
                id: id.trim(),
                label: label.trim(),
                icon: icon?.trim() || 'Package',
                hue: hue?.trim() || '',
                tagline: tagline?.trim() || null,
                image: image?.trim() || null,
            },
        });

        res.status(201).json({ category });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({
                error: 'A category with this ID already exists.',
            });
        }

        next(error);
    }
});

// Update category
router.put('/:id', requireAuth, requireAdmin, async (req, res, next) => {
    try {
        const {
            label,
            icon,
            hue,
            tagline,
            image,
        } = req.body;

        if (!label?.trim()) {
            return res.status(400).json({
                error: 'Category label is required.',
            });
        }

        const category = await prisma.category.update({
            where: {
                id: req.params.id,
            },
            data: {
                label: label.trim(),
                icon: icon?.trim() || 'Package',
                hue: hue?.trim() || '',
                tagline: tagline?.trim() || null,
                image: image?.trim() || null,
            },
        });

        res.json({ category });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({
                error: 'Category not found.',
            });
        }

        next(error);
    }
});

// Delete category
router.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
    try {
        const category = await prisma.category.findUnique({
            where: {
                id: req.params.id,
            },
            include: {
                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        });

        if (!category) {
            return res.status(404).json({
                error: 'Category not found.',
            });
        }

        if (category._count.products > 0) {
            return res.status(409).json({
                error: 'Cannot delete a category that still has products.',
            });
        }

        await prisma.category.delete({
            where: {
                id: req.params.id,
            },
        });

        res.json({
            message: 'Category deleted successfully.',
        });
    } catch (error) {
        next(error);
    }
});

export default router;