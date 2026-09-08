import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Heart, ShoppingCart, User } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import './MobileBottomNav.css';


export default function MobileBottomNav() {
  const { pathname } = useLocation();
  const { cartCount, wishlistCount, user } = useStore();
  const counts = { cartCount, wishlistCount };
  const ITEMS = [
    { id: 'home', to: '/', label: 'Home', icon: Home },
    { id: 'categories', to: '/products', label: 'Categories', icon: LayoutGrid },
    { id: 'wishlist', to: '/wishlist', label: 'Wishlist', icon: Heart, badgeKey: 'wishlistCount' },
    { id: 'cart', to: '/cart', label: 'Cart', icon: ShoppingCart, badgeKey: 'cartCount' },
    { id: 'account', to: '/account', label: 'Account', icon: User },
  ];
  const accountPath = user ? '/account' : '/login';
  return (
    <nav className="bottom-nav">
      {ITEMS.map(({ id, to, label, icon: Icon, badgeKey }) => {
        const itemTo = id === 'account' ? accountPath : to;
        const active =
          itemTo === '/'
            ? pathname === '/'
            : pathname.startsWith(itemTo);

        const badge = badgeKey ? counts[badgeKey] : 0;

        return (
          <Link
            key={id}
            to={itemTo}
            className={`bottom-nav-item ${active ? 'active' : ''}`}
          >
            <span className="bottom-nav-icon-wrap">
              <Icon size={20} />
              {badge > 0 && (
                <span className="bottom-nav-badge">{badge}</span>
              )}
            </span>

            {label}
          </Link>
        );
      })}
    </nav>
  );
}
