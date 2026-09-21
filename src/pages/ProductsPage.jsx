import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shirt, Car, User, Gamepad2 } from 'lucide-react';
import Layout from '../components/Layout';
import Breadcrumb from '../components/Breadcrumb';
import ProductCard from '../components/ProductCard';
import ErrorState from '../components/ErrorState';
import { useStore } from '../context/StoreContext';
import './ProductsPage.css';

const ICONS = { Shirt, Car, User, Gamepad2 };

const BLURBS = {
  tshirts: { title: 'Wear Your Fandom', copy: 'High quality anime t-shirts for every fan!' },
  hotwheels: { title: 'Collect Them All', copy: 'Premium die-cast cars from top brands!' },
  figures: { title: 'Bring Characters To Life', copy: 'Detailed figures from your favorite anime!' },
  rc: { title: 'Speed. Control. Thrill.', copy: 'High performance RC cars & bikes!' },
};

function CategoryRowSkeleton() {
  return (
    <div className="card category-row category-row-skeleton">
      <div className="category-row-inner">
        <div className="category-row-info">
          <span className="skeleton skeleton-category-icon" />
          <div className="skeleton-category-text">
            <span className="skeleton skeleton-label" />
            <span className="skeleton skeleton-blurb" />
            <span className="skeleton skeleton-blurb short" />
          </div>
        </div>

        <div className="category-row-content">
          <div className="category-row-tabs">
            <span className="skeleton skeleton-tab" />
            <span className="skeleton skeleton-tab" />
            <span className="skeleton skeleton-tab" />
          </div>

          <div className="category-row-products">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="product-skeleton" key={i}>
                <span className="skeleton skeleton-product-image" />
                <span className="skeleton skeleton-product-name" />
                <span className="skeleton skeleton-product-price" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
function CategoryRow({ category, products, index = 0 }) {
  const categoryProducts = products.filter(
    (p) => p.category === category.id
  );
  const subs = ['All', ...new Set(categoryProducts.map((p) => p.sub).filter(Boolean))];
  const [activeSub, setActiveSub] = useState('All');
  const Icon = ICONS[category.icon];
  const filtered =
    activeSub === 'All'
      ? categoryProducts
      : categoryProducts.filter((p) => p.sub === activeSub);
  const blurb = BLURBS[category.id];

  return (
    <div
      className="card category-row"
      /* Rows fade in one after another on load rather than all at once,
         so the eye is led down the page instead of hit with everything. */
      style={{ '--row-index': index }}
    >
      <div className="category-row-inner">
        <div className="category-row-info">
          <span className={`category-row-icon ${category.hue}`}>
            <Icon size={22} />
          </span>
          <div className="category-row-info-text">
            <p className="category-row-label">{category.label}</p>
            <p className="category-row-tagline">{blurb.title}</p>
            <p className="category-row-blurb">{blurb.copy}</p>

            <span className="category-row-count">
              {categoryProducts.length} item{categoryProducts.length === 1 ? '' : 's'}
            </span>

            <Link
              to={`/search?q=${encodeURIComponent(category.label)}`}
              className="category-row-viewall"
            >
              View all <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        <div className="category-row-content">
          <div className="category-row-tabs" role="tablist">
            {subs.map((s) => (
              <button
                key={s}
                type="button"
                role="tab"
                aria-selected={activeSub === s}
                onClick={() => setActiveSub(s)}
                className={`category-row-tab ${activeSub === s ? 'active' : ''}`}
              >
                {s}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <p className="category-row-empty">Nothing here yet — try another filter.</p>
          ) : (
            <div className="category-row-products" key={activeSub}>
              {filtered.slice(0, 6).map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const { products, categories, productsLoading, productsError, loadProducts, } = useStore();

  return (
    <Layout>
      <div className="page-container">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Products' }]} />
        <div className="products-page-header">
          <span className="products-page-header-bar" />
          <h1 className="products-page-title">All Categories</h1>
        </div>
        <p className="products-page-subtitle">Explore our wide range of anime & collectables</p>

        <div className="category-rows">
          {productsLoading ? (
            <CategoryRowSkeleton />
          ) : productsError ? (
            <ErrorState
              title="Unable to load products"
              message="We couldn't load the products right now. Please try again later."
              onRetry={loadProducts}
            />
          ) : (categories.map((cat, i) => (
            <CategoryRow key={cat.id} category={cat} products={products} index={i} />
          ))
          )}
        </div>
      </div>
    </Layout>
  );
}