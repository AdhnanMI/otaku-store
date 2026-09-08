import { Router } from 'express';
import multer from 'multer';
import cloudinary from '../lib/cloudinary.js';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const COUPON_CODE = 'JHON2026';
const COUPON_DISCOUNT_RATE = 0.1;
const GST_RATE = 0.18;
const DELIVERY_FEE = 99;

function generateOrderNumber() {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `OTAKU${digits}`;
}

// ---------- Cloudinary upload for payment screenshots ----------

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed.'));
    }

    cb(null, true);
  },
});

function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'otaku-store/payment-proofs',
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

    stream.end(buffer);
  });
}

// ---------- POST /api/orders — place a new order ----------

router.post('/', requireAuth, async (req, res) => {
  const { items, shipping, couponCode } = req.body || {};

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      error: 'Cart is empty.',
    });
  }

  const required = [
    'fullName',
    'phone',
    'addressLine1',
    'city',
    'state',
    'pincode',
  ];

  const missing = required.filter(
    (f) => !shipping?.[f]?.toString().trim()
  );

  if (missing.length) {
    return res.status(400).json({
      error: `Missing shipping fields: ${missing.join(', ')}`,
    });
  }

  // Always recompute pricing server-side from the DB.
  const productIds = items.map((i) => i.productId);

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
  });

  const productMap = new Map(
    products.map((p) => [p.id, p])
  );

  const orderItemsData = [];
  let subtotal = 0;

  for (const { productId, qty } of items) {
    const product = productMap.get(productId);
    const quantity = Number(qty) || 0;

    if (!product || quantity < 1) {
      return res.status(400).json({
        error: `Invalid item in cart: ${productId}`,
      });
    }

    if (product.stock < quantity) {
      return res.status(409).json({
        error: `Not enough stock for "${product.name}". Only ${product.stock} available.`,
      });
    }

    subtotal += product.price * quantity;

    orderItemsData.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      qty: quantity,
    });
  }

  const normalizedCoupon = (couponCode || '')
    .trim()
    .toUpperCase();

  const couponValid = normalizedCoupon === COUPON_CODE;

  const discount = couponValid
    ? Math.round(subtotal * COUPON_DISCOUNT_RATE)
    : 0;

  const delivery = subtotal > 0 ? DELIVERY_FEE : 0;

  const gst = Math.round(
    (subtotal - discount) * GST_RATE
  );

  const total =
    subtotal -
    discount +
    delivery +
    gst;

  const order = await prisma.$transaction(
    async (tx) => {
      // Decrease stock only if enough stock still exists.
      for (const item of orderItemsData) {
        const updated = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: {
              gte: item.qty,
            },
          },
          data: {
            stock: {
              decrement: item.qty,
            },
          },
        });

        if (updated.count !== 1) {
          throw new Error(
            `Not enough stock for "${item.name}". Please refresh and try again.`
          );
        }
      }

      return tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          userId: req.user.id,

          subtotal,
          discount,
          delivery,
          gst,
          total,

          couponCode: couponValid
            ? normalizedCoupon
            : null,

          fullName: shipping.fullName.trim(),
          phone: shipping.phone.trim(),
          email: shipping.email?.trim() || null,

          addressLine1: shipping.addressLine1.trim(),
          addressLine2:
            shipping.addressLine2?.trim() || null,

          city: shipping.city.trim(),
          state: shipping.state.trim(),
          pincode: shipping.pincode.trim(),

          items: {
            create: orderItemsData,
          },
        },

        include: {
          items: true,
        },
      });
    },
    {
      maxWait: 10000,
      timeout: 30000,
    }
  );

  res.status(201).json({
    order,
  });
});

// ---------- GET /api/orders — logged-in user's orders ----------

router.get('/', requireAuth, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: {
      userId: req.user.id,
    },

    include: {
      items: true,
    },

    orderBy: {
      createdAt: 'desc',
    },
  });

  res.json({
    orders,
  });
});

// ---------- GET /api/orders/:id — single order ----------

router.get('/:id', requireAuth, async (req, res) => {
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        {
          id: req.params.id,
        },
        {
          orderNumber: req.params.id,
        },
      ],

      userId: req.user.id,
    },

    include: {
      items: true,
    },
  });

  if (!order) {
    return res.status(404).json({
      error: 'Order not found.',
    });
  }

  res.json({
    order,
  });
});

// ---------- PATCH /api/orders/:id/pay ----------
// Confirm payment with a screenshot upload.

router.patch(
  '/:id/pay',
  requireAuth,
  upload.single('screenshot'),
  async (req, res) => {
    const order = await prisma.order.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
    });

    if (!order) {
      return res.status(404).json({
        error: 'Order not found.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: 'Payment screenshot is required.',
      });
    }

    const cloudinaryResult =
      await uploadToCloudinary(req.file.buffer);

    const updated = await prisma.order.update({
      where: {
        id: order.id,
      },

      data: {
        status: 'PAID',
        paymentProofUrl:
          cloudinaryResult.secure_url,
      },

      include: {
        items: true,
      },
    });

    res.json({
      order: updated,
    });
  }
);

export default router;