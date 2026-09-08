import { Shirt, Car, User, Gamepad2, Bike, Truck, Package } from 'lucide-react';
import './ProductThumb.css';

const ICONS = { Shirt, Car, User, Gamepad2, Bike, Truck, Package };

export default function ProductThumb({ icon = 'Package', hue = 'hue-neutral', size = 'md', className = '' }) {
  const Icon = ICONS[icon] || Package;
  const iconSize = size === 'lg' ? 56 : size === 'sm' ? 22 : 32;
  return (
    <div className={`product-thumb ${size === 'lg' ? 'size-lg' : ''} ${hue} ${className}`}>
      <Icon size={iconSize} strokeWidth={1.5} />
    </div>
  );
}
