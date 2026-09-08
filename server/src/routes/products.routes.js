import { Router } from 'express';
import multer from 'multer';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import cloudinary from '../lib/cloudinary.js';

const router = Router();

// ---------- Product image upload ----------

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024, // 8 MB
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed.'));
    }

    cb(null, true);
  },
});

function uploadToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'otaku-store/products',
        resource_type: 'image',
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
  if (!url || !url.includes('res.cloudinary.com')) {
    return null;
  }

  try {
    const pathname = new URL(url).pathname;
    const uploadIndex = pathname.indexOf('/upload/');

    if (uploadIndex === -1) {
      return null;
    }

    let publicPath = pathname.slice(uploadIndex + '/upload/'.length);

    // Remove version, e.g. v1234567890/
    publicPath = publicPath.replace(/^v\d+\//, '');

    // Remove file extension
    publicPath = publicPath.replace(/\.[^/.]+$/, '');

    return publicPath;
  } catch {
    return null;
  }
}
async function deleteFromCloudinary(url) {
  const publicId = getCloudinaryPublicId(url);

  if (!publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
      type: 'upload',
    });
  } catch (error) {
    console.error('Failed to delete Cloudinary image:', error);
  }
}
// ---------- GET all products ----------

router.get('/', async (req, res) => {
  const { category } = req.query;

  const products = await prisma.product.findMany({
    where: category ? { category: String(category) } : undefined,
    include: {
      categoryRef: true,
    },
    orderBy: { id: 'asc' },
  });

  res.json({ products });
});

// ---------- CREATE product ----------

router.post(
  '/',
  requireAuth,
  requireAdmin,
  upload.single('image'),
  async (req, res) => {
    const {
      id,
      category,
      sub,
      name,
      price,
      stock,
      rating,
      reviews,
      icon,
      hue,
    } = req.body || {};

    if (!id?.trim() || !category?.trim() || !name?.trim()) {
      return res.status(400).json({
        error: 'Product ID, category and name are required.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: 'Product image is required.',
      });
    }

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);
    const parsedRating = Number(rating);
    const parsedReviews = Number(reviews);

    if (!Number.isInteger(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        error: 'Price must be a non-negative integer.',
      });
    }

    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      return res.status(400).json({
        error: 'Stock must be a non-negative integer.',
      });
    }

    try {
      // Upload image to Cloudinary first
      const cloudinaryResult = await uploadToCloudinary(req.file);

      if (!cloudinaryResult?.secure_url) {
        return res.status(500).json({
          error: 'Image upload failed.',
        });
      }

      // Save Cloudinary URL in PostgreSQL
      const product = await prisma.product.create({
        data: {
          id: id.trim(),
          category: category.trim(),
          sub: sub?.trim() || null,
          name: name.trim(),
          price: parsedPrice,
          stock: parsedStock,
          rating: Number.isFinite(parsedRating) ? parsedRating : 0,
          reviews: Number.isInteger(parsedReviews) ? parsedReviews : 0,
          image: cloudinaryResult.secure_url,
          icon: icon?.trim() || '',
          hue: hue?.trim() || '',
        },
        include: {
          categoryRef: true,
        },
      });

      res.status(201).json({ product });
    } catch (error) {
      if (error.code === 'P2002') {
        return res.status(409).json({
          error: 'A product with this ID already exists.',
        });
      }

      if (error.code === 'P2003') {
        return res.status(400).json({
          error: 'The specified category does not exist.',
        });
      }

      throw error;
    }
  }
);

// ---------- DELETE product ----------

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        _count: {
          select: {
            orderItems: true,
          },
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        error: 'Product not found.',
      });
    }

    if (product._count.orderItems > 0) {
      return res.status(409).json({
        error:
          'This product cannot be deleted because it is part of an existing order.',
      });
    }


    await prisma.$transaction([
      prisma.cartItem.deleteMany({
        where: { productId: req.params.id },
      }),
      prisma.wishlistItem.deleteMany({
        where: { productId: req.params.id },
      }),
      prisma.product.delete({
        where: { id: req.params.id },
      }),
    ]);

    // Delete product image from Cloudinary
    await deleteFromCloudinary(product.image);

    res.json({
      message: 'Product deleted successfully.',
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'Product not found.',
      });
    }

    throw error;
  }
});

// ---------- UPDATE product ----------

router.put(
  '/:id',
  requireAuth,
  requireAdmin,
  upload.single('image'),
  async (req, res) => {
    const {
      category,
      sub,
      name,
      price,
      stock,
      rating,
      reviews,
      icon,
      hue,
    } = req.body || {};

    if (!name?.trim() || !category?.trim()) {
      return res.status(400).json({
        error: 'Product name and category are required.',
      });
    }

    const parsedPrice = Number(price);
    const parsedStock = Number(stock);
    const parsedRating = Number(rating);
    const parsedReviews = Number(reviews);

    if (!Number.isInteger(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({
        error: 'Price must be a non-negative integer.',
      });
    }

    if (!Number.isInteger(parsedStock) || parsedStock < 0) {
      return res.status(400).json({
        error: 'Stock must be a non-negative integer.',
      });
    }

    try {
      // Only upload a new image if the admin selected one.
      let image;
      let oldImage;

      if (req.file) {
        oldImage = (
          await prisma.product.findUnique({
            where: { id: req.params.id },
            select: { image: true },
          })
        )?.image;

        const cloudinaryResult = await uploadToCloudinary(req.file);

        if (!cloudinaryResult?.secure_url) {
          return res.status(500).json({
            error: 'Image upload failed.',
          });
        }

        image = cloudinaryResult.secure_url;
      }

      const product = await prisma.product.update({
        where: { id: req.params.id },
        data: {
          category: category.trim(),
          sub: sub?.trim() || null,
          name: name.trim(),
          price: parsedPrice,
          stock: parsedStock,
          rating: Number.isFinite(parsedRating) ? parsedRating : 0,
          reviews: Number.isInteger(parsedReviews) ? parsedReviews : 0,
          ...(image !== undefined ? { image } : {}),
          icon: icon?.trim() || '',
          hue: hue?.trim() || '',
        },
        include: {
          categoryRef: true,
        },
      });

      // Delete previous image only after DB update succeeds
      if (oldImage && image) {
        await deleteFromCloudinary(oldImage);
      }

      res.json({ product });

      res.json({ product });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          error: 'Product not found.',
        });
      }

      if (error.code === 'P2003') {
        return res.status(400).json({
          error: 'The specified category does not exist.',
        });
      }

      throw error;
    }
  }
);

// ---------- GET single product ----------

router.get('/:id', async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: {
      categoryRef: true,
    },
  });

  if (!product) {
    return res.status(404).json({
      error: 'Product not found.',
    });
  }

  res.json({ product });
});

export default router;