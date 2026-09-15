import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LayoutGrid, List, SlidersHorizontal } from 'lucide-react';
import Layout from '../components/Layout';
import Breadcrumb from '../components/Breadcrumb';
import ProductCard from '../components/ProductCard';
import { useStore } from '../context/StoreContext';
import './SearchResultsPage.css';

const PAGE_SIZES = [24, 48, 96];

export default function SearchResultsPage() {
  const { products, categories } = useStore();
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [checkedCats, setCheckedCats] = useState([]);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [pageSize, setPageSize] = useState(24);
  const [visibleCount, setVisibleCount] = useState(24);
  const [viewMode, setViewMode] = useState('grid');

  const matched = useMemo(() => {
    const normalize = (s) =>
      (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const lower = normalize(q);

    return products
      .map((p) => {
        const catLabel = normalize(categories.find((c) => c.id === p.category)?.label || '');
        const name = normalize(p.name);
        const sub = normalize(p.sub);
        return {
          ...p,
          match: name.includes(lower) || sub.includes(lower) || catLabel.includes(lower) ? 2 : 1,
        };
      })
      .filter(
        (p) =>
          p.match === 2 &&
          p.price <= maxPrice &&
          (checkedCats.length === 0 || checkedCats.includes(p.category))
      );
  }, [q, checkedCats, maxPrice, categories, products]);

  const results = useMemo(() => {
    const sorted = [...matched];

    if (sortBy === 'price-asc') sorted.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') sorted.sort((a, b) => b.price - a.price);
    else if (sortBy === 'newest') sorted.reverse();

    return sorted;
  }, [matched, sortBy]);

  // Reset pagination whenever the query or active filters/sort change,
  // so "Load More" doesn't stay stuck on a stale count.
  useEffect(() => {
    setVisibleCount(pageSize);
  }, [q, checkedCats, maxPrice, sortBy, pageSize]);

  const visibleResults = results.slice(0, visibleCount);
  const hasMore = visibleCount < results.length;

  const suggestedProducts = useMemo(() => {
    return [...products].sort(() => 0.5 - Math.random()).slice(0, 6);
  }, [products]);

  const toggleCat = (id) => {
    setCheckedCats((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  return (
    <Layout>
      <div className="page-container">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Search Results' }]} />
        <h1 className="search-title">Search Results</h1>
        <p className="search-subtitle">
          Found <strong>{results.length}</strong> results for &ldquo;<span className="text-red">{q}</span>&rdquo;
        </p>

        <button onClick={() => setFiltersOpen((v) => !v)} className="search-filters-toggle btn btn-outline">
          <SlidersHorizontal size={14} /> Filters
        </button>

        <div className="search-layout">
          <aside className={`search-sidebar ${filtersOpen ? 'open' : ''}`}>
            <div className="card filters-card">
              <div className="filters-card-head">
                <p className="filters-title">Filters</p>
                <button
                  onClick={() => {
                    setCheckedCats([]);
                    setMaxPrice(10000);
                  }}
                  className="filters-clear-btn"
                >
                  Clear All
                </button>
              </div>

              <p className="filters-subtitle">Categories</p>
              <div className="filters-checkbox-list">
                {categories.map((c) => (
                  <label key={c.id} className="filters-checkbox-label">
                    <input type="checkbox" checked={checkedCats.includes(c.id)} onChange={() => toggleCat(c.id)} />
                    {c.label} <span className="filters-checkbox-count">({products.filter((p) => p.category === c.id).length})</span>
                  </label>
                ))}
              </div>

              <p className="filters-subtitle">Price Range</p>
              <input type="range" min={0} max={10000} step={100} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="filters-range" />
              <div className="filters-range-labels">
                <span>₹0</span>
                <span>
                  ₹{maxPrice.toLocaleString('en-IN')}
                  {maxPrice === 10000 ? '+' : ''}
                </span>
              </div>

              {/* Filtering already applies live as you check boxes / drag the
                  slider — this just closes the mobile drawer so you can see
                  the results underneath. */}
              <button
                type="button"
                className="btn btn-outline-red filters-apply-btn"
                onClick={() => setFiltersOpen(false)}
              >
                Show Results
              </button>
            </div>
          </aside>

          <div>
            <div className="search-toolbar">
              <select
                className="search-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="relevance">Sort by: Relevance</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
              <div className="search-view-controls">
                <span className="search-view-label">Show:</span>
                {PAGE_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    className={`search-show-btn ${pageSize === size ? 'active' : ''}`}
                    onClick={() => setPageSize(size)}
                  >
                    {size}
                  </button>
                ))}
                <span className="search-divider" />
                <button
                  type="button"
                  className={`search-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid view"
                >
                  <LayoutGrid size={14} />
                </button>
                <button
                  type="button"
                  className={`search-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  aria-label="List view"
                >
                  <List size={14} />
                </button>
              </div>
            </div>

            <div className="search-results-list">
              {results.length === 0 ? (
                <div className="search-no-results">
                  <h2 className="search-no-results-title">No Results Found</h2>
                  <p className="search-no-results-text">
                    We couldn&apos;t find any matches for &ldquo;<span className="text-red">{q}</span>&rdquo;. Try checking your spelling or using more general terms.
                  </p>

                  <div className="search-no-results-suggestions">
                    <h3 className="search-cat-title">
                      You Might Like <span>({suggestedProducts.length})</span>
                    </h3>
                    <div className="search-results-grid">
                      {suggestedProducts.map((p) => (
                        <ProductCard key={p.id} product={p} />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className={`search-results-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                    {visibleResults.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>

                  {hasMore && (
                    <div className="search-load-more">
                      <button
                        type="button"
                        className="btn btn-outline-red"
                        onClick={() => setVisibleCount((v) => v + pageSize)}
                      >
                        Load More Results
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}