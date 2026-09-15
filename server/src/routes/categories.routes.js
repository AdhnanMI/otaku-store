import { Router } from 'express';
import multer from 'multer';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import cloudinary from '../lib/cloudinary.js';

const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 8 * 1024 * 1024,
    },
    fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed.'));
        }
    },
});

function uploadToCloudinary(file) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'otaku-store/categories',
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        );

        stream.end(file.buffer);
    });
}

function getCloudinaryPublicId(url) {
    try {
        const parsed = new URL(url);

        const uploadIndex = parsed.pathname.indexOf('/upload/');
        if (uploadIndex === -1) return null;

        let publicPath = parsed.pathname.slice(
            uploadIndex + '/upload/'.length
        );

        // Remove version, e.g. v1789498465/
        publicPath = publicPath.replace(/^v\d+\//, '');

        // Remove extension
        publicPath = publicPath.replace(/\.[^/.]+$/, '');

        return publicPath;
    } catch {
        return null;
    }
}

async function deleteFromCloudinary(url) {
    if (!url || !url.includes('res.cloudinary.com')) return;

    const publicId = getCloudinaryPublicId(url);
    if (!publicId) return;

    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Failed to delete category image from Cloudinary:', error);
    }
}

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
router.post(
    '/',
    requireAuth,
    requireAdmin,
    upload.single('image'),
    async (req, res, next) => {
        try {
            const {
                id,
                label,
                icon,
                hue,
                tagline,
            } = req.body;

            if (!id?.trim() || !label?.trim()) {
                return res.status(400).json({
                    error: 'Category ID and label are required.',
                });
            }

            let imageUrl = null;

            if (req.file) {
                const uploaded = await uploadToCloudinary(req.file);
                imageUrl = uploaded.secure_url;
            }

            const category = await prisma.category.create({
                data: {
                    id: id.trim(),
                    label: label.trim(),
                    icon: icon?.trim() || 'Package',
                    hue: hue?.trim() || '',
                    tagline: tagline?.trim() || null,
                    image: imageUrl,
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
    }
);

// Update category
router.put(
    '/:id',
    requireAuth,
    requireAdmin,
    upload.single('image'),
    async (req, res, next) => {
        try {
            const {
                label,
                icon,
                hue,
                tagline,
            } = req.body;

            if (!label?.trim()) {
                return res.status(400).json({
                    error: 'Category label is required.',
                });
            }

            const existingCategory = await prisma.category.findUnique({
                where: {
                    id: req.params.id,
                },
            });

            if (!existingCategory) {
                return res.status(404).json({
                    error: 'Category not found.',
                });
            }

            let imageUrl = existingCategory.image;

            if (req.file) {
                const uploaded = await uploadToCloudinary(req.file);
                imageUrl = uploaded.secure_url;
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
                    image: imageUrl,
                },
            });

            if (req.file && existingCategory.image) {
                await deleteFromCloudinary(existingCategory.image);
            }

            res.json({ category });
        } catch (error) {
            next(error);
        }
    }
);

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

        await deleteFromCloudinary(category.image);

        res.json({
            message: 'Category deleted successfully.',
        });
    } catch (error) {
        next(error);
    }
});

export default router;