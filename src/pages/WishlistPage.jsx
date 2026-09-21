import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Share2, ShoppingCart, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import Breadcrumb from '../components/Breadcrumb';
import ProductThumb from '../components/ProductThumb';
import StarRating from '../components/StarRating';
import ErrorState from '../components/ErrorState';
import { useStore } from '../context/StoreContext';
import './WishlistPage.css';

function WishlistSkeleton() {
  return (
    <div className="wishlist-layout wishlist-skeleton">
      <aside className="wishlist-skeleton-sidebar">
        <div className="card wishlist-skeleton-cat-card">
          <span className="skeleton wishlist-skeleton-cat-title" />

          <div className="wishlist-skeleton-cat-list">
            {Array.from({ length: 5 }).map((_, i) => (
              <span className="skeleton wishlist-skeleton-cat-btn" key={i} />
            ))}
          </div>
        </div>

        <span className="skeleton wishlist-skeleton-promo" />
      </aside>

      <div className="wishlist-grid">
        {Array.from({ length: 8 }).map((_, i) => (
          <div className="wishlist-skeleton-card" key={i}>
            <span className="skeleton wishlist-skeleton-image" />
            <span className="skeleton wishlist-skeleton-tag" />
            <span className="skeleton wishlist-skeleton-heart" />

            <span className="skeleton wishlist-skeleton-name" />
            <span className="skeleton wishlist-skeleton-name short" />
            <span className="skeleton wishlist-skeleton-price" />
            <span className="skeleton wishlist-skeleton-rating" />

            <div className="wishlist-skeleton-buttons">
              <span className="skeleton wishlist-skeleton-move" />
              <span className="skeleton wishlist-skeleton-delete" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default function WishlistPage() {
  const {
    wishlistItems,
    toggleWishlist,
    moveWishlistToCart,
    addToCart,
    categories,
    authLoading,
    wishlistLoading,
    wishlistError,
    loadWishlist,
  } = useStore();
  const [activeCat, setActiveCat] = useState('all');

  const filtered = activeCat === 'all' ? wishlistItems : wishlistItems.filter((p) => p.category === activeCat);

  const counts = categories.reduce((acc, c) => {
    acc[c.id] = wishlistItems.filter((p) => p.category === c.id).length;
    return acc;
  }, {});

  const moveAllToCart = () => {
    wishlistItems.forEach((p) => addToCart(p.id, 1));
  };

  // The button was previously inert — no handler at all. Uses the native
  // share sheet where available and falls back to copying the link.
  const [shareNote, setShareNote] = useState('');

  const shareWishlist = async () => {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title: 'My Otaku Store Wishlist', url });
        return;
      }

      await navigator.clipboard.writeText(url);
      setShareNote('Link copied');
    } catch {
      setShareNote('Could not share');
    }

    setTimeout(() => setShareNote(''), 2000);
  };

  return (
    <Layout>
      <div className="page-container">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Wishlist' }]} />
        <div className="wishlist-header">
          <div>
            <div className="wishlist-title-row">
              <Heart size={20} style={{ fill: 'var(--color-red)', color: 'var(--color-red)' }} />
              <h1 className="wishlist-title">My Wishlist</h1>
            </div>
            <p className="wishlist-subtitle">
              You have {wishlistItems.length} item{wishlistItems.length === 1 ? '' : 's'} in your wishlist
            </p>
          </div>
          <div className="wishlist-header-actions">
            <button className="btn btn-outline" onClick={shareWishlist}>
              <Share2 size={14} /> {shareNote || 'Share Wishlist'}
            </button>
            <button onClick={moveAllToCart} disabled={wishlistItems.length === 0} className="btn btn-primary">
              <ShoppingCart size={14} /> Move All to Cart
            </button>
          </div>
        </div>
        {authLoading || wishlistLoading ? (
          <WishlistSkeleton />
        ) : wishlistError ? (
          <ErrorState
            title="Unable to load wishlist"
            message="We couldn't load your wishlist right now. Please try again later."
            onRetry={loadWishlist}
          />
        ) : (<div className="wishlist-layout">
          <aside className="wishlist-sidebar">
            <div className="card wishlist-cat-card">
              <p className="wishlist-cat-title">Categories</p>
              <div className="wishlist-cat-list">
                <button onClick={() => setActiveCat('all')} className={`wishlist-cat-btn ${activeCat === 'all' ? 'active' : ''}`}>
                  All Items <span>{wishlistItems.length}</span>
                </button>
                {categories.map((c) => (
                  <button key={c.id} onClick={() => setActiveCat(c.id)} className={`wishlist-cat-btn ${activeCat === c.id ? 'active' : ''}`}>
                    {c.label} <span>{counts[c.id]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="wishlist-promo-card">
              <Heart size={26} />
              <p className="wishlist-promo-title">Love something?</p>
              <p className="wishlist-promo-copy">Add items to your wishlist and shop them later!</p>
            </div>
          </aside>

          <div>
            {filtered.length === 0 ? (
              <div className="wishlist-empty">
                <Heart size={40} />
                <p className="text-muted">No items here yet.</p>
                <Link to="/products" className="btn btn-primary">
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="wishlist-grid">
                {filtered.map((product, i) => (
                  <div key={product.id} className="wishlist-card" style={{ '--card-index': i }}>
                    <button onClick={() => toggleWishlist(product.id)} className="wishlist-card-heart" aria-label="Remove from wishlist">
                      <Heart size={14} />
                    </button>
                    <span className="wishlist-card-tag">
                      {categories.find((c) => c.id === product.category)?.label || product.category}
                    </span>
                    <div className="wishlist-card-thumb">
                      {product.image ? (
                        <img src={product.image} alt={product.name} loading="lazy" />
                      ) : (
                        <ProductThumb icon={product.icon} hue={product.hue} />
                      )}
                    </div>
                    <p className="wishlist-card-name">{product.name}</p>
                    <p className="wishlist-card-price">₹{product.price.toLocaleString('en-IN')}</p>
                    <StarRating rating={product.rating} reviews={product.reviews} />
                    <div className="wishlist-card-actions">
                      <button onClick={() => moveWishlistToCart(product.id)} className="wishlist-move-btn">
                        Move to Cart
                      </button>
                      <button onClick={() => toggleWishlist(product.id)} className="wishlist-delete-btn" aria-label="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </Layout>
  );
}