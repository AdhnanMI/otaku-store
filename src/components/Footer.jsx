import { Send, Shield, Truck, RotateCcw, Headphones } from 'lucide-react';
import Logo from './Logo';
import './Footer.css';

const iconProps = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

function Instagram(props) {
  return (
    <svg {...iconProps} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}
function Facebook(props) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M15 3h-2.5A4.5 4.5 0 0 0 8 7.5V10H6v3h2v8h3v-8h2.5l.5-3H11V7.5A1.5 1.5 0 0 1 12.5 6H15V3z" />
    </svg>
  );
}
function Youtube(props) {
  return (
    <svg {...iconProps} {...props}>
      <rect x="2.5" y="6" width="19" height="12" rx="3" />
      <path d="M10.5 9.5v5l4.5-2.5-4.5-2.5z" fill="currentColor" stroke="none" />
    </svg>
  );
}
function Twitter(props) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M4 4l7.5 8.5L4.5 20h2.3l6-6.9 5 6.9H21l-7.8-9L20.5 4h-2.3l-5.5 6.3L8 4H4z" />
    </svg>
  );
}

const FEATURES = [
  { icon: Shield, title: 'Secure Payment', sub: '100% Secure Checkout' },
  { icon: Truck, title: 'Fast Delivery', sub: 'Quick & Reliable Shipping' },
  { icon: RotateCcw, title: 'Easy Returns', sub: '7-Day Easy Returns' },
  { icon: Headphones, title: '24/7 Support', sub: "We're Here to Help" },
];

const COLUMNS = [
  { title: 'Shop', links: ['All Products', 'Anime T-Shirts', 'Hot Wheels', 'Anime Figures', 'RC Cars & Bikes'] },
  { title: 'Customer Care', links: ['Track Products', 'Shipping & Delivery', 'Returns & Refunds', 'FAQs', 'Contact Us'] },
  { title: 'My Account', links: ['Log In', 'Wishlist', 'Cart', 'Order History', 'Profile'] },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-features-wrap">
        <div className="footer-features">
          {FEATURES.map(({ icon: Icon, title, sub }) => (
            <div key={title} className="footer-feature">
              <Icon size={22} />
              <div>
                <p className="footer-feature-title">{title}</p>
                <p className="footer-feature-sub">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="footer-columns">
        <div className="footer-col-span-2">
          <Logo />
          <p className="footer-about-copy">
            Your one-stop shop for anime merch, collectibles, hot wheels, RC cars & bikes and more!
          </p>
          <div className="footer-social">
            <Instagram />
            <Facebook />
            <Youtube />
            <Twitter />
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="footer-col-title">{col.title}</p>
            <ul className="footer-col-links">
              {col.links.map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
          </div>
        ))}

        <div className="footer-col-span-2">
          <p className="footer-col-title">Subscribe</p>
          <p className="footer-newsletter-copy">Get updates on new arrivals and exclusive offers.</p>
          <div className="footer-newsletter-form">
            <input type="email" placeholder="Enter your email" className="footer-newsletter-input" />
            <button className="footer-newsletter-btn" aria-label="Subscribe">
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        © 2026 Otaku Store. All rights reserved. &nbsp;|&nbsp; Privacy Policy &nbsp;|&nbsp; Terms & Conditions
      </div>
    </footer>
  );
}
