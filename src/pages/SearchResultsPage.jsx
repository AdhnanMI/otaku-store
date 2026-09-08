import { useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowRight, LayoutGrid, List, SlidersHorizontal } from 'lucide-react';
import Layout from '../components/Layout';
import Breadcrumb from '../components/Breadcrumb';
import ProductCard from '../components/ProductCard';
import { useStore } from '../context/StoreContext';
import './SearchResultsPage.css';

export default function SearchResultsPage() {
  const { products, categories } = useStore();
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [checkedCats, setCheckedCats] = useState([]);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const results = useMemo(() => {
    const normalize = (s) =>
      (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const lower = normalize(q);
    const scored = products.map((p) => {
      const catLabel = normalize(categories.find((c) => c.id === p.category)?.label || '');
      const name = normalize(p.name);
      const sub = normalize(p.sub);
      return {
        ...p,
        match: name.includes(lower) || sub.includes(lower) || catLabel.includes(lower) ? 2 : 1,
      };
    });
    return scored.filter((p) => p.match === 2 && p.price <= maxPrice && (checkedCats.length === 0 || checkedCats.includes(p.category)));
  }, [q, checkedCats, maxPrice, categories]);
  const grouped = categories.map((c) => ({ ...c, items: results.filter((p) => p.category === c.id) })).filter((c) => c.items.length > 0);

  const suggestedProducts = useMemo(() => {
    return [...products].sort(() => 0.5 - Math.random()).slice(0, 6);
  }, []);

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

              <button className="btn btn-outline-red filters-apply-btn">Apply Filters</button>
            </div>
          </aside>

          <div>
            <div className="search-toolbar">
              <select className="search-sort-select">
                <option>Sort by: Relevance</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest First</option>
              </select>
              <div className="search-view-controls">
                <span className="search-view-label">Show:</span>
                <button className="search-show-btn active">24</button>
                <button className="search-show-btn">48</button>
                <button className="search-show-btn">96</button>
                <span className="search-divider" />
                <button className="search-view-btn active">
                  <LayoutGrid size={14} />
                </button>
                <button className="search-view-btn">
                  <List size={14} />
                </button>
              </div>
            </div>

            <div className="search-results-list">
              {grouped.length === 0 && (
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
              )}
              {grouped.map((cat) => (
                <div key={cat.id}>
                  <div className="search-cat-header">
                    <h2 className="search-cat-title">
                      {cat.label} <span>({cat.items.length})</span>
                    </h2>
                    <Link to="/products" className="view-all-link">
                      View All <ArrowRight size={12} />
                    </Link>
                  </div>
                  <div className="search-results-grid">
                    {cat.items.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {results.length > 0 && (
              <div className="search-load-more">
                <button className="btn btn-outline-red">Load More Results</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
