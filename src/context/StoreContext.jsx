import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { apiFetch } from '../api/api';
const StoreContext = createContext(null);

const COUPON_CODE = 'JHON2026';
const COUPON_DISCOUNT_RATE = 0.1;

function generateOrderId() {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `OTAKU${digits}`;
}

export function StoreProvider({ children }) {
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(null);
  const cartSyncTimeout = useRef(null);
  const [cart, setCart] = useState([]);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [shippingInfo, setShippingInfo] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [orderDbId, setOrderDbId] = useState(null);
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [wishlistError, setWishlistError] = useState(null);

  useEffect(() => {
    return () => {
      if (cartSyncTimeout.current) {
        clearTimeout(cartSyncTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await apiFetch('/auth/me');
        setUser(data.user);
      } catch (error) {
        if (error.status === 401) {
          setUser(null);
        } else {
          console.error('Failed to load user:', error);
        }
      } finally {
        setAuthLoading(false);
      }
    };

    loadUser();
  }, []);
  const loadCart = async () => {
    if (!user) return;

    setCartLoading(true);
    setCartError(null);

    try {
      const data = await apiFetch('/cart');

      const savedCart = data.cart?.items || [];

      setCart(
        savedCart.map((item) => ({
          id: item.productId,
          qty: item.qty,
        }))
      );
    } catch (error) {
      if (error.status === 401) {
        setUser(null);
      }

      setCartError(error);
      console.error('Failed to load cart:', error);
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setCartLoading(false);
      return;
    }

    loadCart();
  }, [user]);
  const loadWishlist = async () => {
    if (!user) return;

    setWishlistLoading(true);
    setWishlistError(null);

    try {
      const data = await apiFetch('/wishlist');
      const savedWishlist = data.wishlist?.items || [];

      setWishlist(
        savedWishlist.map((item) => item.productId)
      );
    } catch (error) {
      if (error.status === 401) {
        setUser(null);
      }

      setWishlistError(error);
      console.error('Failed to load wishlist:', error);
    } finally {
      setWishlistLoading(false);
    }
  };
  useEffect(() => {
    if (!user) {
      setWishlistLoading(false);
      return;
    }

    loadWishlist();
  }, [user]);
  const loadProducts = async () => {
    setProductsLoading(true);
    setProductsError(null);

    try {
      const data = await apiFetch('/products');
      setProducts(data.products);
    } catch (error) {
      console.error('Failed to load products:', error);
      setProductsError(error);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openQuickView = (product) => setQuickViewProduct(product);
  const closeQuickView = () => setQuickViewProduct(null);
  const categories = useMemo(() => {
    const uniqueCategories = new Map();

    products.forEach((product) => {
      if (product.categoryRef) {
        uniqueCategories.set(product.categoryRef.id, product.categoryRef);
      }
    });

    return Array.from(uniqueCategories.values());
  }, [products]);
  const findProduct = (id) =>
    products.find((p) => p.id === id);
  const syncCart = (cartItems) => {
    if (!user) return;

    if (cartSyncTimeout.current) {
      clearTimeout(cartSyncTimeout.current);
    }

    cartSyncTimeout.current = setTimeout(async () => {
      try {
        await apiFetch('/cart', {
          method: 'PUT',
          body: JSON.stringify({
            items: cartItems.map((item) => ({
              productId: item.id,
              qty: item.qty,
            })),
          }),
        });
      } catch (error) {
        if (error.status === 401) {
          setUser(null);
        }

        console.error('Failed to sync cart:', error);
      }
    }, 300);
  };
  const addToCart = (id, qty = 1) => {
    const product = findProduct(id);

    if (!product) {
      console.error('Product not found:', id);
      return;
    }

    const stock = Number(product.stock) || 0;

    // Product is completely out of stock.
    if (stock <= 0) {
      return;
    }

    setCart((prev) => {
      const existing = prev.find((c) => c.id === id);

      const currentQty = existing ? existing.qty : 0;
      const requestedQty = Number(qty) || 0;
      const newQty = currentQty + requestedQty;

      // Don't allow the cart quantity to exceed available stock.
      if (newQty > stock) {
        return prev;
      }

      const updatedCart = existing
        ? prev.map((c) =>
          c.id === id
            ? { ...c, qty: newQty }
            : c
        )
        : [
          ...prev,
          {
            id,
            qty: requestedQty,
          },
        ];

      syncCart(updatedCart);

      return updatedCart;
    });
  };
  const removeFromCart = (id) => {
    setCart((prev) => {
      const updatedCart = prev.filter((c) => c.id !== id);

      syncCart(updatedCart);

      return updatedCart;
    });
  };
  const setCartQty = (id, qty) => {
    const product = findProduct(id);

    if (!product) return;

    const stock = Number(product.stock) || 0;

    // Never allow quantity below 1.
    if (qty < 1) return;

    // Never allow quantity above available stock.
    if (qty > stock) return;

    setCart((prev) => {
      const updatedCart = prev.map((c) =>
        c.id === id
          ? { ...c, qty }
          : c
      );

      syncCart(updatedCart);

      return updatedCart;
    });
  };
  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    syncCart([]);
  };
  const syncWishlist = (wishlistItems) => {
    if (!user) return;

    apiFetch('/wishlist', {
      method: 'PUT',
      body: JSON.stringify({
        items: wishlistItems.map((id) => ({
          productId: id,
        })),
      }),
    }).catch((error) => {
      if (error.status === 401) {
        setUser(null);
      }

      console.error('Failed to sync wishlist:', error);
    });
  };
  const toggleWishlist = (id) => {
    setWishlist((prev) => {
      const updatedWishlist = prev.includes(id)
        ? prev.filter((w) => w !== id)
        : [...prev, id];

      syncWishlist(updatedWishlist);

      return updatedWishlist;
    });
  };

  const moveWishlistToCart = (id) => {
    addToCart(id, 1);

    setWishlist((prev) => {
      const updatedWishlist = prev.filter((w) => w !== id);

      syncWishlist(updatedWishlist);

      return updatedWishlist;
    });
  };

  const moveCartToWishlist = (id) => {
    setWishlist((prev) => {
      const updatedWishlist = prev.includes(id)
        ? prev
        : [...prev, id];

      syncWishlist(updatedWishlist);

      return updatedWishlist;
    });

    removeFromCart(id);
  };

  const applyCoupon = (rawCode) => {
    const normalized = (rawCode || '').trim().toUpperCase();
    if (!normalized) {
      return { success: false, message: 'Please enter a coupon code.' };
    }
    if (normalized === COUPON_CODE) {
      setAppliedCoupon(normalized);
      return { success: true, message: `Coupon applied! You saved ${COUPON_DISCOUNT_RATE * 100}%.` };
    }
    return { success: false, message: 'Invalid coupon code.' };
  };

  const removeCoupon = () => setAppliedCoupon(null);

  const saveShippingInfo = (info) => setShippingInfo(info);

  const placeOrder = async (info) => {
    setShippingInfo(info);

    const data = await apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify({
        items: cart.map((item) => ({
          productId: item.id,
          qty: item.qty,
        })),
        shipping: info,
        couponCode: appliedCoupon,
      }),
    });

    setOrderId(data.order.orderNumber);
    setOrderDbId(data.order.id);

    return data.order;
  };

  const resetOrder = () => {
    setOrderId(null);
    setShippingInfo(null);
  };

  const cartItems = useMemo(
    () => cart.map((c) => ({ ...c, product: findProduct(c.id) })).filter((c) => c.product),
    [cart]
  );

  const wishlistItems = useMemo(
    () => wishlist.map((id) => findProduct(id)).filter(Boolean),
    [wishlist]
  );

  const subtotal = useMemo(
    () => cartItems.reduce((sum, c) => sum + c.product.price * c.qty, 0),
    [cartItems]
  );
  const discount = appliedCoupon ? Math.round(subtotal * COUPON_DISCOUNT_RATE) : 0;
  const delivery = subtotal > 0 ? 99 : 0;
  const gst = Math.round((subtotal - discount) * 0.18);
  const total = subtotal - discount + delivery + gst;

  const value = {
    cart,
    cartItems,
    cartCount: cartItems.reduce((n, c) => n + c.qty, 0),
    addToCart,
    removeFromCart,
    setCartQty,
    clearCart,
    wishlist,
    wishlistItems,
    wishlistCount: wishlistItems.length,
    toggleWishlist,
    moveWishlistToCart,
    moveCartToWishlist,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    shippingInfo,
    saveShippingInfo,
    orderId,
    orderDbId,
    placeOrder,
    resetOrder,
    subtotal,
    discount,
    delivery,
    gst,
    total,
    quickViewProduct,
    openQuickView,
    closeQuickView,
    products,
    productsLoading,
    productsError,
    loadProducts,
    categories,
    user,
    authLoading,
    setUser,
    wishlistLoading,
    cartLoading,
    cartError,
    wishlistError,
    loadWishlist,
    loadCart,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
