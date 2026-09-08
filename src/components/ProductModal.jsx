import { useEffect, useRef, useState } from 'react';
import {
  X,
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
} from 'lucide-react';
import StarRating from './StarRating';
import { useStore } from '../context/StoreContext';
import './ProductModal.css';

const CATEGORY_COPY = {
  tshirts: {
    description: (p) =>
      `Wear your fandom with the ${p.name} — a ${p.sub?.toLowerCase()} cut in breathable, heavyweight cotton with a soft-hand print that resists cracking and fading. Reinforced stitching at the seams keeps it holding its shape wash after wash, so it looks as sharp on day one hundred as it does on day one.`,
    features: [
      '100% combed cotton, pre-shrunk fabric',
      'High-density print, won\u2019t crack or peel',
      'Reinforced double-stitched seams',
      'True-to-size, unisex fit',
    ],
  },

  hotwheels: {
    description: (p) =>
      `The ${p.name} is a die-cast collectible built with real proportions and a glossy factory-grade finish. Free-rolling wheels and precision panel lines make it as satisfying to display as it is to race across the floor.`,
    features: [
      'Premium die-cast metal body',
      'Free-rolling precision wheels',
      'Authentic livery and panel detailing',
      'Collector-grade packaging',
    ],
  },

  figures: {
    description: (p) =>
      `Bring your favorite arc to life with the ${p.name}, a highly detailed ${p.sub} figure sculpted with screen-accurate proportions and hand-painted finishing. Every pose is engineered for a dynamic, display-ready stance.`,
    features: [
      'Hand-painted, screen-accurate detailing',
      'Premium PVC + ABS construction',
      'Stable display base included',
      'Officially inspired design',
    ],
  },

  rc: {
    description: (p) =>
      `Take control with the ${p.name} — built for real off-the-shelf performance with responsive steering, durable shock-absorbing suspension, and a rechargeable battery pack ready for back-to-back runs.`,
    features: [
      'Full-function responsive remote control',
      'Durable shockproof suspension',
      'Rechargeable battery included',
      'Ready-to-run out of the box',
    ],
  },
};

function getCopy(product) {
  const copy = CATEGORY_COPY[product.category];

  if (copy) {
    return {
      description: copy.description(product),
      features: copy.features,
    };
  }

  return {
    description: `The ${product.name} is a fan-favorite pick, crafted with premium materials and finished to a standard collectors trust.`,
    features: [
      'Premium build quality',
      'Officially inspired design',
      'Carefully quality-checked',
      'Fast, secure shipping',
    ],
  };
}

export default function ProductModal() {
  const {
    quickViewProduct,
    closeQuickView,
    wishlist,
    toggleWishlist,
    addToCart,
    categories,
  } = useStore();

  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const panelRef = useRef(null);
  const closeTimerRef = useRef(null);

  const product = quickViewProduct;
  const isOpen = !!product;

  const categoryLabel =
    categories.find((c) => c.id === product?.category)?.label ||
    product?.category ||
    '';

  const stock = Number(product?.stock) || 0;
  const isOutOfStock = stock <= 0;

  useEffect(() => {
    if (isOpen) {
      setQty(1);
      setJustAdded(false);
    }
  }, [product?.id, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeQuickView();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, closeQuickView]);

  useEffect(() => {
    return () => clearTimeout(closeTimerRef.current);
  }, []);

  if (!isOpen) return null;

  const isWished = wishlist.includes(product.id);
  const { description, features } = getCopy(product);

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    addToCart(product.id, qty);

    setJustAdded(true);

    clearTimeout(closeTimerRef.current);

    closeTimerRef.current = setTimeout(() => {
      setJustAdded(false);
    }, 1800);
  };

  const handleIncreaseQty = () => {
    setQty((currentQty) =>
      Math.min(stock, currentQty + 1)
    );
  };

  const handleDecreaseQty = () => {
    setQty((currentQty) =>
      Math.max(1, currentQty - 1)
    );
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeQuickView();
    }
  };

  return (
    <div
      className="product-modal-overlay"
      onMouseDown={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-modal-title"
    >
      <div
        className="product-modal-panel"
        ref={panelRef}
      >
        <button
          className="product-modal-close"
          onClick={closeQuickView}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="product-modal-media">
          <img
            src={product.image}
            alt={product.name}
          />
        </div>

        <div className="product-modal-body">
          <div className="product-modal-scroll">
            <span className="product-modal-category">
              {categoryLabel}
              {product.sub
                ? ` \u00b7 ${product.sub}`
                : ''}
            </span>

            <h2
              id="product-modal-title"
              className="product-modal-title"
            >
              {product.name}
            </h2>

            <div className="product-modal-rating-row">
              <StarRating
                rating={product.rating}
                reviews={product.reviews}
                size={14}
              />
            </div>

            <div className="product-modal-price-row">
              <span className="product-modal-price">
                ₹{product.price.toLocaleString('en-IN')}
              </span>

              <span className="product-modal-price-note">
                Inclusive of all taxes
              </span>
            </div>

            {/* Stock status */}
            <div
              className={`product-modal-stock ${
                isOutOfStock ? 'out-of-stock' : ''
              }`}
            >
              {isOutOfStock
                ? 'Out of Stock'
                : `${stock} in stock`}
            </div>

            <p className="product-modal-description">
              {description}
            </p>

            <ul className="product-modal-features">
              {features.map((f) => (
                <li key={f}>
                  <Check size={14} />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <div className="product-modal-perks">
              <div className="product-modal-perk">
                <Truck size={16} />
                <span>Free delivery over ₹999</span>
              </div>

              <div className="product-modal-perk">
                <ShieldCheck size={16} />
                <span>Authentic guarantee</span>
              </div>

              <div className="product-modal-perk">
                <RotateCcw size={16} />
                <span>7-day easy returns</span>
              </div>
            </div>
          </div>

          <div className="product-modal-footer">
            <div className="product-modal-qty">
              <button
                onClick={handleDecreaseQty}
                aria-label="Decrease quantity"
                disabled={
                  isOutOfStock || qty <= 1
                }
              >
                <Minus size={14} />
              </button>

              <span>{qty}</span>

              <button
                onClick={handleIncreaseQty}
                aria-label="Increase quantity"
                disabled={
                  isOutOfStock || qty >= stock
                }
              >
                <Plus size={14} />
              </button>
            </div>

            <button
              className={`product-modal-wishlist-btn ${
                isWished ? 'active' : ''
              }`}
              onClick={() =>
                toggleWishlist(product.id)
              }
              aria-label="Toggle wishlist"
            >
              <Heart size={18} />
            </button>

            <button
              className={`product-modal-cart-btn ${
                justAdded ? 'added' : ''
              }`}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
            >
              {isOutOfStock ? (
                <>
                  <ShoppingCart size={16} />
                  Out of Stock
                </>
              ) : justAdded ? (
                <>
                  <Check size={16} />
                  Added to Cart
                </>
              ) : (
                <>
                  <ShoppingCart size={16} />
                  Add to Cart
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}