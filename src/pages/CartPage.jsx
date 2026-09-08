import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, Trash2, Heart, ChevronLeft, ChevronRight, CreditCard, Check, X } from 'lucide-react';
import Layout from '../components/Layout';
import Breadcrumb from '../components/Breadcrumb';
import ProductThumb from '../components/ProductThumb';
import StarRating from '../components/StarRating';
import ConfirmDialog from '../components/ConfirmDialog';
import CheckoutModal from '../components/CheckoutModal';
import { useStore } from '../context/StoreContext';
import './CartPage.css';


function CartSkeleton() {
  return (
    <div className="cart-skeleton">
      <div className="cart-skeleton-main">
        <div className="card cart-skeleton-items-card">
          <div className="cart-skeleton-table-head">
            <span className="skeleton" />
            <span className="skeleton" />
            <span className="skeleton" />
            <span className="skeleton" />
          </div>

          {Array.from({ length: 3 }).map((_, i) => (
            <div className="cart-skeleton-item" key={i}>
              <div className="skeleton cart-skeleton-thumb" />

              <div className="cart-skeleton-details">
                <span className="skeleton cart-skeleton-category" />
                <span className="skeleton cart-skeleton-name" />
                <span className="skeleton cart-skeleton-name short" />
                <span className="skeleton cart-skeleton-rating" />
              </div>

              <span className="skeleton cart-skeleton-price" />

              <div className="cart-skeleton-qty">
                <span className="skeleton" />
                <span className="skeleton" />
                <span className="skeleton" />
              </div>

              <span className="skeleton cart-skeleton-total" />
            </div>
          ))}
        </div>
      </div>

      <div className="cart-skeleton-sidebar">
        <div className="card cart-skeleton-summary">
          <span className="skeleton cart-skeleton-summary-title" />

          <span className="skeleton cart-skeleton-line" />
          <span className="skeleton cart-skeleton-line" />
          <span className="skeleton cart-skeleton-line" />
          <span className="skeleton cart-skeleton-line" />

          <div className="cart-skeleton-summary-total">
            <span className="skeleton" />
            <span className="skeleton" />
          </div>

          <span className="skeleton cart-skeleton-checkout" />
          <span className="skeleton cart-skeleton-continue" />
        </div>

        <div className="card cart-skeleton-summary">
          <span className="skeleton cart-skeleton-coupon-title" />
          <span className="skeleton cart-skeleton-coupon" />
        </div>

        <div className="card cart-skeleton-summary">
          <span className="skeleton cart-skeleton-payment-title" />
          <div className="cart-skeleton-payment">
            {Array.from({ length: 5 }).map((_, i) => (
              <span className="skeleton" key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
export default function CartPage() {
  const {
    cartItems,
    setCartQty,
    removeFromCart,
    clearCart,
    moveCartToWishlist,
    subtotal,
    discount,
    delivery,
    gst,
    total,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    cartLoading,
    authLoading,
    categories,
    cartError,
    loadCart,
    user,
  } = useStore();
  const isEmpty = cartItems.length === 0;

  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loginRequiredOpen, setLoginRequiredOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState(null);

  const handleClearCart = () => {
    clearCart();
    setConfirmClearOpen(false);
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const result = applyCoupon(couponInput);
    setCouponFeedback(result);
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponInput('');
    setCouponFeedback(null);
  };

  return (
    <Layout>
      <div className="page-container">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Cart' }]} />
        <div className="cart-header">
          <ShoppingCart size={20} className="text-red" />
          <h1 className="cart-title">Your Cart</h1>
        </div>
        <p className="cart-subtitle">{cartItems.length} items in your cart</p>
        {authLoading || cartLoading ? (
          <CartSkeleton />
        ) : cartError ? (
          <div className="cart-error card">
            <h2>Unable to load cart</h2>
            <p>
              We couldn't load your cart right now.
              Please try again later.
            </p>

            <button
              type="button"
              className="btn btn-primary"
              onClick={loadCart}
            >
              Try Again
            </button>
          </div>
        ) : isEmpty ? (
          <div className="cart-empty">
            <ShoppingCart size={40} />
            <p className="text-muted">Your cart is empty.</p>
            <Link to="/products" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="card cart-items-card">
              <div className="cart-table-head">
                <span>Product</span>
                <span>Price</span>
                <span>Quantity</span>
                <span className="align-right">Total</span>
              </div>

              <div className="cart-items-list">
                {cartItems.map(({ id, qty, product }) => (
                  <div key={id} className="cart-item-row">
                    <div className="cart-item-main">
                      <div className="cart-item-thumb">
                        <ProductThumb icon={product.icon} hue={product.hue} />
                      </div>
                      <div className="cart-item-details">
                        <span className="cart-item-category">
                          {categories.find((category) => category.id === product.category)?.label ||
                            product.category}
                        </span>
                        <p className="cart-item-name">{product.name}</p>
                        <StarRating rating={product.rating} reviews={product.reviews} />
                        <div className="cart-item-actions">
                          <button onClick={() => moveCartToWishlist(id)}>
                            <Heart size={12} /> Move to Wishlist
                          </button>
                          <button onClick={() => removeFromCart(id)}>
                            <Trash2 size={12} /> Remove
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="cart-item-price">₹{product.price.toLocaleString('en-IN')}</div>

                    <div className="cart-item-qty">
                      <button
                        onClick={() => setCartQty(id, qty - 1)}
                        className="cart-qty-btn"
                        aria-label="Decrease quantity"
                        disabled={qty <= 1}
                      >
                        <Minus size={12} />
                      </button>

                      <span className="cart-qty-value">{qty}</span>

                      <button
                        onClick={() => setCartQty(id, qty + 1)}
                        className="cart-qty-btn"
                        aria-label="Increase quantity"
                        disabled={qty >= product.stock}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div className="cart-item-total">
                      <span className="cart-item-total-label">Total:</span>
                      <span className="cart-item-total-value">₹{(product.price * qty).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-items-footer">
                <button onClick={() => setConfirmClearOpen(true)} className="cart-clear-btn">
                  <Trash2 size={12} /> Clear Cart
                </button>
              </div>
            </div>

            <div className="cart-sidebar">
              <div className="card cart-summary-card">
                <h2 className="cart-summary-title">Order Summary</h2>
                <div className="cart-summary-rows">
                  <div className="cart-summary-row">
                    <span className="text-muted">Subtotal ({cartItems.length} items)</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="cart-summary-row discount">
                    <span>Discount</span>
                    <span>- ₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="cart-summary-row">
                    <span className="text-muted">Delivery Charges</span>
                    <span>₹{delivery}</span>
                  </div>
                  <div className="cart-summary-row">
                    <span className="text-muted">GST (18%)</span>
                    <span>₹{gst.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div className="cart-summary-total">
                  <span className="cart-summary-total-label">Total</span>
                  <span className="cart-summary-total-value">₹{total.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && <p className="cart-summary-savings">You save ₹{discount.toLocaleString('en-IN')} on this order!</p>}

                <button
                  className="btn btn-primary cart-checkout-btn"
                  onClick={() => {
                    if (!user) {
                      setLoginRequiredOpen(true);
                      return;
                    }

                    setCheckoutOpen(true);
                  }}
                >
                  Proceed to Checkout <ChevronRight size={16} />
                </button>
                <Link to="/products" className="btn btn-outline cart-continue-btn">
                  <ChevronLeft size={16} /> Continue Shopping
                </Link>
              </div>

              <div className="card cart-summary-card">
                <p className="cart-coupon-label">Have a discount code?</p>
                {appliedCoupon ? (
                  <div className="cart-coupon-applied">
                    <span>
                      <Check size={13} /> <strong>{appliedCoupon}</strong> applied &mdash; 10% off
                    </span>
                    <button onClick={handleRemoveCoupon} aria-label="Remove coupon">
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <form className="cart-coupon-row" onSubmit={handleApplyCoupon}>
                    <input
                      type="text"
                      placeholder="Enter coupon code"
                      className="cart-coupon-input"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                    />
                    <button type="submit" className="cart-coupon-apply">Apply</button>
                  </form>
                )}
                {couponFeedback && !appliedCoupon && (
                  <p className={`cart-coupon-feedback ${couponFeedback.success ? 'success' : 'error'}`}>
                    {couponFeedback.message}
                  </p>
                )}
              </div>

              <div className="card cart-summary-card">
                <p className="cart-payment-label">We Accept</p>
                <div className="cart-payment-icons">
                  {['VISA', 'MasterCard', 'UPI', 'Paytm', 'AmEx'].map((p) => (
                    <span key={p} className="cart-payment-badge">
                      <CreditCard size={12} /> {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmClearOpen}
        title="Clear your cart?"
        message="This will remove all items from your cart. This action can't be undone."
        confirmLabel="Yes, clear cart"
        cancelLabel="Cancel"
        onConfirm={handleClearCart}
        onCancel={() => setConfirmClearOpen(false)}
      />
      <ConfirmDialog
        open={loginRequiredOpen}
        title="Login required"
        message="You are not logged in. Please log in to continue with checkout."
        confirmLabel="OK"
        cancelLabel="Cancel"
        onConfirm={() => setLoginRequiredOpen(false)}
        onCancel={() => setLoginRequiredOpen(false)}
      />
      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </Layout>
  );
}
