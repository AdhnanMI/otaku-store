import { Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Logo.css';

export default function Logo({ className = '' }) {
  return (
    <Link to="/" className={`logo ${className}`}>
      <span className="logo-badge">
        <Flame size={18} fill="currentColor" />
      </span>
      <span className="logo-text">
        <span className="logo-text-top">OTAKU</span>
        <span className="logo-text-bottom">STORE</span>
      </span>
    </Link>
  );
}
