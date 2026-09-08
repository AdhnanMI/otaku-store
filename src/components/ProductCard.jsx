import { Heart, ShoppingCart } from 'lucide-react';
import StarRating from './StarRating';
import { useStore } from '../context/StoreContext';
import './ProductCard.css';

export default function ProductCard({ product, tag }) {
  const {
    wishlist,
    toggleWishlist,
    addToCart,
    openQuickView,
  } = useStore();

  const isWished = wishlist.includes(product.id);
  const isOutOfStock = product.stock <= 0;

  return (
    <div
      className="product-card"
      onClick={() => openQuickView(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openQuickView(product);
        }
      }}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleWishlist(product.id);
        }}
        aria-label="Toggle wishlist"
        className={`product-card-wishlist-btn ${
          isWished ? 'active' : ''
        }`}
      >
        <Heart size={14} />
      </button>

      {tag && (
        <span className="product-card-tag">
          {tag}
        </span>
      )}

      <div className="product-card-thumb">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
        />
      </div>

      <div className="product-card-body">
        <p className="product-card-name">
          {product.name}
        </p>

        <StarRating
          rating={product.rating}
          reviews={product.reviews}
        />

        <div className="product-card-footer">
          <div>
            <span className="product-card-price">
              ₹{product.price.toLocaleString('en-IN')}
            </span>

            <span
              className={`product-card-stock ${
                isOutOfStock ? 'out-of-stock' : ''
              }`}
            >
              {isOutOfStock
                ? 'Out of Stock'
                : `${product.stock} in stock`}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();

              if (isOutOfStock) return;

              addToCart(product.id, 1);
            }}
            aria-label={
              isOutOfStock
                ? 'Out of stock'
                : 'Add to cart'
            }
            disabled={isOutOfStock}
            className={`product-card-cart-btn ${
              isOutOfStock ? 'disabled' : ''
            }`}
          >
            <ShoppingCart size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}