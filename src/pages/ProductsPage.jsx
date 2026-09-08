import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Shirt, Car, User, Gamepad2, AlertCircle, } from 'lucide-react';
import Layout from '../components/Layout';
import Breadcrumb from '../components/Breadcrumb';
import ProductCard from '../components/ProductCard';
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
function CategoryRow({ category, products }) {
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
    <div className="card category-row">
      <div className="category-row-inner">
        <div className="category-row-info">
          <span className={`category-row-icon ${category.hue}`}>
            <Icon size={20} />
          </span>
          <div>
            <p className="category-row-label">{category.label}</p>
            <p className="category-row-blurb">{blurb.title}</p>
            <p className="category-row-blurb">{blurb.copy}</p>
          </div>
        </div>

        <div className="category-row-content">
          <div className="category-row-tabs">
            {subs.map((s) => (
              <button key={s} onClick={() => setActiveSub(s)} className={`category-row-tab ${activeSub === s ? 'active' : ''}`}>
                {s}
              </button>
            ))}
          </div>
          <div className="category-row-products"> {filtered.slice(0, 6).map((p) => (<ProductCard key={p.id} product={p} />))} </div>
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
            <div className="products-error">
              <AlertCircle size={32} />

              <h2>Unable to load products</h2>

              <p>
                We couldn't load the products right now.
                Please try again later.
              </p>

              <button
                type="button"
                className="products-error-retry"
                onClick={loadProducts}
              >
                Try Again
              </button>
            </div>
          ) : (categories.map((cat) => (
            <CategoryRow key={cat.id} category={cat} products={products} />
          ))
          )}
        </div>
      </div>
    </Layout>
  );
}
