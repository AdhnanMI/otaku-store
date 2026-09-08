import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, User, Search, Menu, X, Sun, Moon } from 'lucide-react';
import Logo from './Logo';
import { useStore } from '../context/StoreContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/track', label: 'Track Order' },
  { to: '/orders', label: 'orders' },
];

export default function Navbar({ showSearch = true }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { cartCount, wishlistCount, user } = useStore();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const submitSearch = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setDrawerOpen(false);
  };

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-row">
        <button className="navbar-hamburger" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
          <Menu size={24} />
        </button>

        <Logo />

        <nav className="navbar-links">
          {NAV_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="navbar-link">
              {l.label}
            </Link>
          ))}

          {user?.role === 'ADMIN' && (
            <Link to="/admin" className="navbar-link">
              Admin Control
            </Link>
          )}
        </nav>

        {showSearch && (
          <form onSubmit={submitSearch} className="navbar-search">
            <div className="navbar-search-wrap">
              <Search size={16} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder="Search anime merch, figures, hot wheels..."
                className="navbar-search-input"
              />
            </div>
          </form>
        )}

        <div className='clr'>
          <button onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

        </div>
        <div className={`navbar-actions ${showSearch ? '' : 'no-search'}`}>
          {/* <button onClick={toggleTheme} aria-label="Toggle theme" className="navbar-icon-btn">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button> */}
          <Link to="/wishlist" className="navbar-icon-link">
            <span className="navbar-icon-wrap">
              <Heart size={18} />
              {wishlistCount > 0 && <span className="navbar-badge">{wishlistCount}</span>}
            </span>
            <span className="navbar-icon-link-label">Wishlist</span>
          </Link>
          <Link to="/cart" className="navbar-icon-link">
            <span className="navbar-icon-wrap">
              <ShoppingCart size={18} />
              {cartCount > 0 && <span className="navbar-badge">{cartCount}</span>}
            </span>
            <span className="navbar-icon-link-label">Cart</span>
          </Link>
          <Link to={user ? "/account" : "/login"} className="navbar-login-btn">
            <User size={16} />
            {user ? user.name : 'Log In'}
          </Link>
        </div>
        <div className="navbar-mobile-actions">
          <Link to="/wishlist" style={{ position: 'relative' }}>
            <Heart size={19} />
            {wishlistCount > 0 && <span className="navbar-badge">{wishlistCount}</span>}
          </Link>
          <Link to="/cart" style={{ position: 'relative' }}>
            <ShoppingCart size={19} />
            {cartCount > 0 && <span className="navbar-badge">{cartCount}</span>}
          </Link>
          <Link to="/login">
            <User size={19} />
          </Link>
        </div>
      </div>

      {showSearch && (
        <form onSubmit={submitSearch} className="navbar-search mobile">
          <div className="navbar-search-wrap">
            <Search size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              placeholder="Search for products..."
              className="navbar-search-input"
            />
          </div>
        </form>
      )}

      <div className={`navbar-drawer-overlay ${drawerOpen ? 'open' : ''}`} aria-hidden={!drawerOpen}>
        <div className="navbar-drawer-backdrop" onClick={closeDrawer} />
        <div className="navbar-drawer">
          <div className="navbar-drawer-header">
            <Logo />
            <button onClick={closeDrawer} aria-label="Close menu" className="navbar-drawer-close">
              <X size={22} />
            </button>
          </div>
          <nav className="navbar-drawer-links">
            {NAV_LINKS.map((l) => (
              <Link key={l.to} to={l.to} onClick={closeDrawer} className="navbar-drawer-link">
                {l.label}
              </Link>
            ))}
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                onClick={closeDrawer}
                className="navbar-drawer-link"
              >
                Admin Control
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
