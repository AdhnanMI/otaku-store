import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { AlertCircle,ChevronLeft, ChevronRight, PlayCircle, ArrowRight, Flame, Shirt, Car, User, Gamepad2 } from 'lucide-react';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import { useStore } from '../context/StoreContext';
import './LandingPage.css';

const SLIDES = [
  {
    eyebrow: 'Welcome to Otaku Store',
    title: 'Your Ultimate',
    highlight: 'Anime & Collectibles',
    tail: 'Destination',
    copy: 'Anime T-Shirts, Hot Wheels, Anime Figures, RC Cars & Bikes – All in One Place!',
  },
  {
    eyebrow: 'New Arrivals Weekly',
    title: 'Level Up',
    highlight: 'Your Collection',
    tail: '',
    copy: 'Fresh drops on figures, apparel and die-cast every week. Never miss a release.',
  },
  {
    eyebrow: 'Limited Time',
    title: 'Festive Sale',
    highlight: 'Up To 40% Off',
    tail: '',
    copy: 'Grab your favourite characters and rides before the sale ends.',
  },
];

const ICONS = { Shirt, Car, User, Gamepad2 };

const AUTOPLAY_INTERVAL_MS = 4500;
const IDLE_RESUME_MS = 3000;
const SWIPE_THRESHOLD_PX = 50;

// Drop your own images in here — swap these paths for your actual files
// (e.g. import from '../assets/hero/...' if you're bundling them, or use
// paths under /public/images/hero/ like below).
function CategoryTileSkeleton() {
  return (
    <div className="category-tile category-tile-skeleton">
      <div className="category-tile-content">
        <div className="category-tile-top">
          <span className="skeleton skeleton-category-icon" />
          <span className="skeleton skeleton-category-label" />
        </div>

        <span className="skeleton skeleton-category-desc" />
        <span className="skeleton skeleton-category-btn" />
      </div>

      <span className="skeleton skeleton-category-image" />
    </div>
  );
}

function TrendingSkeleton() {
  return (
    <div className="trending-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div className="landing-product-skeleton" key={i}>
          <span className="skeleton skeleton-product-image" />
          <span className="skeleton skeleton-product-name" />
          <span className="skeleton skeleton-product-price" />
          <span className="skeleton skeleton-product-rating" />
        </div>
      ))}
    </div>
  );
}

export default function LandingPage() {
  const { products, productsLoading, categories, productsError, loadProducts, } = useStore();
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);
  const trending = products.slice(0, 6);

  const intervalRef = useRef(null);
  const idleTimeoutRef = useRef(null);
  const touchStartXRef = useRef(0);
  const touchDeltaXRef = useRef(0);

  const stopAutoplay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startAutoplay = useCallback(() => {
    stopAutoplay();
    intervalRef.current = setInterval(() => {
      setSlide((s) => (s + 1) % SLIDES.length);
    }, AUTOPLAY_INTERVAL_MS);
  }, [stopAutoplay]);

  const scheduleAutoplayResume = useCallback(() => {
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    idleTimeoutRef.current = setTimeout(startAutoplay, IDLE_RESUME_MS);
  }, [startAutoplay]);

  // Any manual interaction pauses autoplay, then resumes once the user goes idle
  const handleUserInteraction = useCallback(() => {
    stopAutoplay();
    scheduleAutoplayResume();
  }, [stopAutoplay, scheduleAutoplayResume]);

  useEffect(() => {
    startAutoplay();
    return () => {
      stopAutoplay();
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    };
  }, [startAutoplay, stopAutoplay]);

  const goToSlide = (i) => {
    setSlide(i);
    handleUserInteraction();
  };

  const nextSlide = () => {
    setSlide((s) => (s + 1) % SLIDES.length);
    handleUserInteraction();
  };

  const prevSlide = () => {
    setSlide((s) => (s - 1 + SLIDES.length) % SLIDES.length);
    handleUserInteraction();
  };

  // Desktop: pause on hover, resume once the pointer leaves and idles out
  const handleMouseEnter = () => stopAutoplay();
  const handleMouseLeave = () => scheduleAutoplayResume();

  // Mobile/touch: swipe left/right to change slides
  const handleTouchStart = (e) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchDeltaXRef.current = 0;
    stopAutoplay();
  };

  const handleTouchMove = (e) => {
    touchDeltaXRef.current = e.touches[0].clientX - touchStartXRef.current;
  };

  const handleTouchEnd = () => {
    const dx = touchDeltaXRef.current;
    if (dx > SWIPE_THRESHOLD_PX) {
      prevSlide();
    } else if (dx < -SWIPE_THRESHOLD_PX) {
      nextSlide();
    } else {
      scheduleAutoplayResume();
    }
    touchDeltaXRef.current = 0;
  };

  return (
    <Layout>
      <section className="hero-section">
        <div
          className="hero-banner"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className="hero-track"
            style={{
              width: `${SLIDES.length * 100}%`,
              transform: `translateX(-${slide * (100 / SLIDES.length)}%)`,
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {SLIDES.map((s, i) => (
              <div className="hero-slide" style={{ width: `${100 / SLIDES.length}%` }} key={i}>
                <div className="hero-grid">
                  <div>
                    <p className="hero-eyebrow">{s.eyebrow}</p>
                    <h1 className="hero-title">
                      {s.title}
                      <br />
                      <span className="highlight">{s.highlight}</span> {s.tail}
                    </h1>
                    <p className="hero-copy">{s.copy}</p>
                  </div>
                  <img src='./images/d1.png' className='hero-img' />
                  <Link to="/products" className="btn btn-primary shop-btn">
                    Shop Now
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <button onClick={prevSlide} className="hero-nav-btn prev" aria-label="Previous slide">
            <ChevronLeft size={20} />
          </button>
          <button onClick={nextSlide} className="hero-nav-btn next" aria-label="Next slide">
            <ChevronRight size={20} />
          </button>
          <div className="hero-dots">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`hero-dot ${i === slide ? 'active' : ''}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
      <section className="landing-section">
        <div className="landing-section-header">
          <h2 className="section-title">Shop by Category</h2>
          <Link to="/products" className="view-all-link">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="category-grid">
          {productsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <CategoryTileSkeleton key={i} />
            ))
          ) : (
            categories.map((cat) => {
              const Icon = ICONS[cat.icon];

              return (
                <a
                  key={cat.id}
                  href={`/search?q=${encodeURIComponent(cat.label)}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/search?q=${encodeURIComponent(cat.label)}`);
                  }}
                  className="category-tile"
                >
                  <div className="category-tile-content">
                    <div className="category-tile-top">
                      <span className={`category-tile-icon ${cat.hue}`}>
                        <Icon size={18} strokeWidth={2} />
                      </span>
                      <p className="category-tile-label">{cat.label}</p>
                    </div>

                    {cat.tagline && (
                      <p className="category-tile-desc">{cat.tagline}</p>
                    )}

                    <span className="category-tile-btn">Explore</span>
                  </div>

                  {cat.image && (
                    <img
                      src={cat.image}
                      alt={cat.label}
                      className="category-tile-image"
                    />
                  )}
                </a>
              );
            })
          )}
        </div>
      </section>

      <section className="landing-section">
        <div className="landing-section-header">
          <h2 className="section-title">
            <Flame size={18} className="text-red" />
            Trending Now
          </h2>
          <Link to="/products" className="view-all-link">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        {productsLoading ? (
          <TrendingSkeleton />
        ) : productsError ? (
          <div className="landing-products-error">
            <AlertCircle size={28} />

            <p>Unable to load products.</p>

            <button
              type="button"
              onClick={loadProducts}
            >
              Try Again
            </button>
          </div>
        ) : (<div className="trending-grid">
          {trending.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
        )}
      </section>

      <div className="landing-bottom-spacer" />
    </Layout>
  );
}
