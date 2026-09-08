import { Heart, ShoppingCart } from 'lucide-react';
import StarRating from './StarRating';
import { useStore } from '../context/StoreContext';
import './ProductCard.css';

export default function ProductCard({ product, tag }) {
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const isWished = wishlist.includes(product.id);

  return (
    <div className="product-card">
      <button
        onClick={() => toggleWishlist(product.id)}
        aria-label="Toggle wishlist"
        className={`product-card-wishlist-btn ${isWished ? 'active' : ''}`}
      >
        <Heart size={14} />
      </button>
      {tag && <span className="product-card-tag">{tag}</span>}
      <div className="product-card-thumb">
        <img src={product.image} alt={product.name} loading="lazy" />
      </div>
      <div className="product-card-body">
        <p className="product-card-name">{product.name}</p>
        <StarRating rating={product.rating} reviews={product.reviews} />
        <div className="product-card-footer">
          <span className="product-card-price">₹{product.price.toLocaleString('en-IN')}</span>
          <button onClick={() => addToCart(product.id, 1)} aria-label="Add to cart" className="product-card-cart-btn">
            <ShoppingCart size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
