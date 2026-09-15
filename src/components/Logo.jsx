import { Flame } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Logo.css';

export default function Logo({ className = '' }) {
  return (
    <Link to="/" className={`logo ${className}`}>

      <img src='./favicon.png' width={70} />

      <span className="logo-text">
        <span className="logo-text-top">OTAKU</span>
        <span className="logo-text-bottom">STORE</span>
      </span>
    </Link>
  );
}
