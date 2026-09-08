import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// GET /api/admin/orders
// Admin only — view all customer orders.
router.get('/orders', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ orders });
  } catch (error) {
    console.error('Failed to load admin orders:', error);

    res.status(503).json({
      error: 'Database is temporarily unavailable. Please try again.',
    });
  }
});

// GET /api/admin/orders/:id
// Admin only — view a single order.
router.get('/orders/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: req.params.id },
          { orderNumber: req.params.id },
        ],
      },
      include: {
        items: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        error: 'Order not found.',
      });
    }

    res.json({ order });
  } catch (error) {
    console.error('Failed to load admin order:', error);

    res.status(503).json({
      error: 'Database is temporarily unavailable. Please try again.',
    });
  }
});
// GET /api/admin/orders/:id
// Admin only — view a single order.
// PATCH /api/admin/orders/:id
// Admin only — update order status and shipping information.
// PATCH /api/admin/orders/:id
// Admin only — update order status and shipping information.
// PATCH /api/admin/orders/:id
// Admin only — update order status and shipping information.
router.patch('/orders/:id', requireAuth, requireAdmin, async (req, res) => {
  const {
    status,
    fullName,
    phone,
    email,
    addressLine1,
    addressLine2,
    city,
    state,
    pincode,
  } = req.body || {};

  const validStatuses = [
    'PLACED',
    'PAID',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
  ];

  if (status !== undefined && !validStatuses.includes(status)) {
    return res.status(400).json({
      error: 'Invalid order status.',
    });
  }

  try {
    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { id: req.params.id },
          { orderNumber: req.params.id },
        ],
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

    let updated;

    // ==================================================
    // 1. NON-CANCELLED → CANCELLED
    // Restore the stock.
    // ==================================================

    if (
      status === 'CANCELLED' &&
      order.status !== 'CANCELLED'
    ) {
      const operations = [];

      for (const item of order.items) {
        operations.push(
          prisma.product.update({
            where: {
              id: item.productId,
            },
            data: {
              stock: {
                increment: item.qty,
              },
            },
          })
        );
      }

      operations.push(
        prisma.order.update({
          where: {
            id: order.id,
          },
          data: {
            status: 'CANCELLED',

            ...(fullName !== undefined && {
              fullName: fullName.trim(),
            }),

            ...(phone !== undefined && {
              phone: phone.trim(),
            }),

            ...(email !== undefined && {
              email: email?.trim() || null,
            }),

            ...(addressLine1 !== undefined && {
              addressLine1: addressLine1.trim(),
            }),

            ...(addressLine2 !== undefined && {
              addressLine2:
                addressLine2?.trim() || null,
            }),

            ...(city !== undefined && {
              city: city.trim(),
            }),

            ...(state !== undefined && {
              state: state.trim(),
            }),

            ...(pincode !== undefined && {
              pincode: pincode.trim(),
            }),
          },
        })
      );

      const results = await prisma.$transaction(
        operations
      );

      updated = results[results.length - 1];
    }

    // ==================================================
    // 2. CANCELLED → NON-CANCELLED
    // Deduct the stock again.
    // ==================================================

    else if (
      order.status === 'CANCELLED' &&
      status !== undefined &&
      status !== 'CANCELLED'
    ) {
      // First check whether enough stock is available.
      const products = await prisma.product.findMany({
        where: {
          id: {
            in: order.items.map(
              (item) => item.productId
            ),
          },
        },
      });

      const productMap = new Map(
        products.map((product) => [
          product.id,
          product,
        ])
      );

      for (const item of order.items) {
        const product = productMap.get(item.productId);

        if (!product) {
          return res.status(400).json({
            error: `Product "${item.name}" no longer exists.`,
          });
        }

        if (product.stock < item.qty) {
          return res.status(409).json({
            error:
              `Cannot reactivate this order. ` +
              `"${product.name}" only has ` +
              `${product.stock} in stock, but ` +
              `${item.qty} is required.`,
          });
        }
      }

      // Deduct stock and update the order together.
      const operations = [];

      for (const item of order.items) {
        operations.push(
          prisma.product.updateMany({
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
          })
        );
      }

      operations.push(
        prisma.order.update({
          where: {
            id: order.id,
          },
          data: {
            status,

            ...(fullName !== undefined && {
              fullName: fullName.trim(),
            }),

            ...(phone !== undefined && {
              phone: phone.trim(),
            }),

            ...(email !== undefined && {
              email: email?.trim() || null,
            }),

            ...(addressLine1 !== undefined && {
              addressLine1: addressLine1.trim(),
            }),

            ...(addressLine2 !== undefined && {
              addressLine2:
                addressLine2?.trim() || null,
            }),

            ...(city !== undefined && {
              city: city.trim(),
            }),

            ...(state !== undefined && {
              state: state.trim(),
            }),

            ...(pincode !== undefined && {
              pincode: pincode.trim(),
            }),
          },
        })
      );

      const results = await prisma.$transaction(
        operations
      );

      updated = results[results.length - 1];
    }

    // ==================================================
    // 3. ALL OTHER STATUS CHANGES
    // No stock change.
    // ==================================================

    else {
      updated = await prisma.order.update({
        where: {
          id: order.id,
        },

        data: {
          ...(status !== undefined && {
            status,
          }),

          ...(fullName !== undefined && {
            fullName: fullName.trim(),
          }),

          ...(phone !== undefined && {
            phone: phone.trim(),
          }),

          ...(email !== undefined && {
            email: email?.trim() || null,
          }),

          ...(addressLine1 !== undefined && {
            addressLine1: addressLine1.trim(),
          }),

          ...(addressLine2 !== undefined && {
            addressLine2:
              addressLine2?.trim() || null,
          }),

          ...(city !== undefined && {
            city: city.trim(),
          }),

          ...(state !== undefined && {
            state: state.trim(),
          }),

          ...(pincode !== undefined && {
            pincode: pincode.trim(),
          }),
        },

        include: {
          items: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }

    // If the transaction returned the order without
    // the user relation, fetch it again with the same
    // structure used by the normal update.
    if (updated && !updated.user) {
      updated = await prisma.order.findUnique({
        where: {
          id: order.id,
        },
        include: {
          items: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }

    res.json({
      order: updated,
    });
  } catch (error) {
    console.error(
      'Failed to update admin order:',
      error
    );

    res.status(503).json({
      error:
        'Database is temporarily unavailable. Please try again.',
    });
  }
});
// GET /api/admin/stats
// Admin only — dashboard summary.
// GET /api/admin/stats
// Admin only — dashboard summary.
router.get('/stats', requireAuth, requireAdmin, async (_req, res) => {
  try {
    const [
      totalOrders,
      cancelledOrders,
      totalProducts,
      totalUsers,
      lowStockProducts,
      sales,
    ] = await Promise.all([
      prisma.order.count(),

      prisma.order.count({
        where: {
          status: 'CANCELLED',
        },
      }),

      prisma.product.count(),

      prisma.user.count(),

      prisma.product.count({
        where: {
          stock: {
            lte: 5,
          },
        },
      }),

      prisma.order.aggregate({
        where: {
          status: {
            not: 'CANCELLED',
          },
        },
        _sum: {
          total: true,
        },
      }),
    ]);

    res.json({
      stats: {
        totalOrders,
        cancelledOrders,
        totalProducts,
        totalUsers,
        lowStockProducts,
        totalSales: sales._sum.total || 0,
      },
    });
  } catch (error) {
    console.error('Failed to load admin stats:', error);

    res.status(503).json({
      error: 'Database is temporarily unavailable. Please try again.',
    });
  }
});
export default router;