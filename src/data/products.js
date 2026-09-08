// Mock catalog data. `icon` refers to a lucide-react icon name rendered by <ProductThumb />.
// `hue` drives a placeholder gradient standing in for real product photography.

export const CATEGORIES = [
  {
    id: 'tshirts',
    label: 'Anime T-Shirts',
    icon: 'Shirt',
    hue: 'hue-red',
    tagline: 'Stylish. Bold. Anime.',
    image: '/images/categories/tshirts.png',
  },
  {
    id: 'hotwheels',
    label: 'Hot Wheels',
    icon: 'Car',
    hue: 'hue-sky',
    tagline: 'Mini Cars. Mega Passion.',
    image: '/images/categories/hotwheels.png',
  },
  {
    id: 'figures',
    label: 'Anime Figures',
    icon: 'User',
    hue: 'hue-violet',
    tagline: 'Collect. Display. Be Proud.',
    image: '/images/categories/figures.png',
  },
  {
    id: 'rc',
    label: 'RC Cars & Bikes',
    icon: 'Gamepad2',
    hue: 'hue-orange-light',
    tagline: 'Remote Control. Real Thrill.',
    image: '/images/categories/rc.png',
  },
];

export const PRODUCTS = [
  // Anime T-Shirts
  { id: 'ts-01', category: 'tshirts', sub: 'Long Sleeve', name: 'Shadow Ninja Long Sleeve', price: 899, rating: 4.6, reviews: 42, image: '/images/products/ts-01.png', icon: 'Shirt', hue: 'hue-red' },
  { id: 'ts-02', category: 'tshirts', sub: 'Long Sleeve', name: 'Crimson Cloud Hoodie', price: 1299, rating: 4.8, reviews: 23, image: '/images/products/ts-02.png', icon: 'Shirt', hue: 'hue-red-dark' },
  { id: 'ts-03', category: 'tshirts', sub: 'Oversized', name: 'Titan Slayer Oversized Tee', price: 799, rating: 4.7, reviews: 98, image: '/images/products/ts-03.png', icon: 'Shirt', hue: 'hue-slate' },
  { id: 'ts-04', category: 'tshirts', sub: 'Short Sleeve', name: 'Sage Mode T-Shirt', price: 699, rating: 4.5, reviews: 31, image: '/images/products/ts-04.png', icon: 'Shirt', hue: 'hue-amber' },
  { id: 'ts-05', category: 'tshirts', sub: 'Long Sleeve', name: 'Curse Energy Long Sleeve', price: 899, rating: 4.8, reviews: 36, image: '/images/products/ts-05.png', icon: 'Shirt', hue: 'hue-indigo' },
  { id: 'ts-06', category: 'tshirts', sub: 'Hoodies', name: 'Straw Hat Voyage Hoodie', price: 1399, rating: 4.6, reviews: 27, image: '/images/products/ts-06.png', icon: 'Shirt', hue: 'hue-red-gold' },
  { id: 'ts-07', category: 'tshirts', sub: 'Short Sleeve', name: 'Desert Sand Tee', price: 699, rating: 4.6, reviews: 27, image: '/images/products/ts-07.png', icon: 'Shirt', hue: 'hue-yellow-orange' },
  { id: 'ts-08', category: 'tshirts', sub: 'Tank Tops', name: 'Wind Style Tank Top', price: 599, rating: 4.4, reviews: 19, image: '/images/products/ts-08.png', icon: 'Shirt', hue: 'hue-cyan' },
  { id: 'ts-09', category: 'tshirts', sub: 'Oversized', name: 'Full Moon Oversized Tee', price: 849, rating: 4.7, reviews: 44, image: '/images/products/ts-09.png', icon: 'Shirt', hue: 'hue-neutral' },
  { id: 'ts-10', category: 'tshirts', sub: 'Long Sleeve', name: 'Ultra Instinct Long Sleeve', price: 899, rating: 4.6, reviews: 42, image: '/images/products/ts-10.png', icon: 'Shirt', hue: 'hue-orange' },

  // Hot Wheels
  { id: 'hw-01', category: 'hotwheels', sub: 'Nissan', name: 'Nissan Skyline GT-R R34', price: 599, rating: 4.6, reviews: 18, image: '/images/products/hw-01.png', icon: 'Car', hue: 'hue-sky' },
  { id: 'hw-02', category: 'hotwheels', sub: 'Porsche', name: 'Porsche 911 GT3 RS', price: 599, rating: 4.8, reviews: 26, image: '/images/products/hw-02.png', icon: 'Car', hue: 'hue-slate-light' },
  { id: 'hw-03', category: 'hotwheels', sub: 'Lamborghini', name: 'Lamborghini Aventador', price: 899, rating: 4.8, reviews: 21, image: '/images/products/hw-03.png', icon: 'Car', hue: 'hue-gold' },
  { id: 'hw-04', category: 'hotwheels', sub: 'Toyota', name: 'Toyota Supra MK4', price: 599, rating: 4.7, reviews: 22, image: '/images/products/hw-04.png', icon: 'Car', hue: 'hue-red' },
  { id: 'hw-05', category: 'hotwheels', sub: 'Ford', name: 'Ford Mustang GT', price: 599, rating: 4.6, reviews: 16, image: '/images/products/hw-05.png', icon: 'Car', hue: 'hue-orange' },
  { id: 'hw-06', category: 'hotwheels', sub: 'Toyota', name: 'Toyota AE86 Trueno', price: 599, rating: 4.6, reviews: 17, image: '/images/products/hw-06.png', icon: 'Car', hue: 'hue-neutral-dark' },
  { id: 'hw-07', category: 'hotwheels', sub: 'McLaren', name: 'McLaren Senna', price: 599, rating: 4.7, reviews: 14, image: '/images/products/hw-07.png', icon: 'Car', hue: 'hue-orange-light' },
  { id: 'hw-08', category: 'hotwheels', sub: 'Mustang', name: 'Mustang 5-Car Pack', price: 899, rating: 4.5, reviews: 12, image: '/images/products/hw-08.png', icon: 'Package', hue: 'hue-blue' },

  // Anime Figures
  { id: 'af-01', category: 'figures', sub: 'Naruto', name: 'Whirlpool Warrior Action Figure', price: 1799, rating: 4.8, reviews: 126, image: '/images/products/af-01.png', icon: 'User', hue: 'hue-gold' },
  { id: 'af-02', category: 'figures', sub: 'Naruto', name: 'Silver Fang Action Figure', price: 1899, rating: 4.8, reviews: 76, image: '/images/products/af-02.png', icon: 'User', hue: 'hue-slate-light' },
  { id: 'af-03', category: 'figures', sub: 'Naruto', name: 'Sharingan Rival Action Figure', price: 1799, rating: 4.7, reviews: 98, image: '/images/products/af-03.png', icon: 'User', hue: 'hue-indigo' },
  { id: 'af-04', category: 'figures', sub: 'One Piece', name: 'Straw Hat Captain Figure', price: 1799, rating: 4.8, reviews: 88, image: '/images/products/af-04.png', icon: 'User', hue: 'hue-red-gold' },
  { id: 'af-05', category: 'figures', sub: 'Demon Slayer', name: 'Water Breathing Figure', price: 1799, rating: 4.6, reviews: 42, image: '/images/products/af-05.png', icon: 'User', hue: 'hue-teal' },
  { id: 'af-06', category: 'figures', sub: 'Jujutsu Kaisen', name: 'Limitless Sorcerer Figure', price: 1799, rating: 4.9, reviews: 112, image: '/images/products/af-06.png', icon: 'User', hue: 'hue-violet-deep' },
  { id: 'af-07', category: 'figures', sub: 'Dragon Ball', name: 'Ultra Instinct Figure', price: 1499, rating: 4.8, reviews: 64, image: '/images/products/af-07.png', icon: 'User', hue: 'hue-blue' },
  { id: 'af-08', category: 'figures', sub: 'Attack on Titan', name: 'Wings of Freedom Figure', price: 1899, rating: 4.7, reviews: 64, image: '/images/products/af-08.png', icon: 'User', hue: 'hue-emerald' },
  { id: 'af-09', category: 'figures', sub: 'Naruto', name: 'Desert Guardian Figure', price: 1749, rating: 4.7, reviews: 64, image: '/images/products/af-09.png', icon: 'User', hue: 'hue-yellow-orange' },
  { id: 'af-10', category: 'figures', sub: 'Naruto', name: 'Blue Wolf Action Figure', price: 1799, rating: 4.7, reviews: 98, image: '/images/products/af-10.png', icon: 'User', hue: 'hue-sky-light' },

  // RC Cars & Bikes
  { id: 'rc-01', category: 'rc', sub: 'RC Drift Cars', name: 'RC Drift Car 1:16 Scale', price: 2999, rating: 4.7, reviews: 33, image: '/images/products/rc-01.png', icon: 'Gamepad2', hue: 'hue-slate-light' },
  { id: 'rc-02', category: 'rc', sub: 'RC Buggies', name: 'RC Buggy 4WD Off-Roader', price: 2699, rating: 4.6, reviews: 28, image: '/images/products/rc-02.png', icon: 'Gamepad2', hue: 'hue-orange' },
  { id: 'rc-03', category: 'rc', sub: 'RC Bikes', name: '1:10 Scale 4WD RC Car', price: 4499, rating: 4.7, reviews: 15, image: '/images/products/rc-03.png', icon: 'Gamepad2', hue: 'hue-neutral-dark' },
  { id: 'rc-04', category: 'rc', sub: 'RC Sports Cars', name: 'RC Sports Car 1:18', price: 2699, rating: 4.6, reviews: 19, image: '/images/products/rc-04.png', icon: 'Gamepad2', hue: 'hue-red' },
  { id: 'rc-05', category: 'rc', sub: 'RC Bikes', name: 'RC Dirt Bike', price: 2699, rating: 4.5, reviews: 12, image: '/images/products/rc-05.png', icon: 'Bike', hue: 'hue-amber' },
  { id: 'rc-06', category: 'rc', sub: 'RC Bikes', name: 'RC Street Bike', price: 2699, rating: 4.6, reviews: 14, image: '/images/products/rc-06.png', icon: 'Bike', hue: 'hue-blue' },
  { id: 'rc-07', category: 'rc', sub: 'RC Bikes', name: 'RC Kawasaki Ninja ZX-10R', price: 3999, rating: 4.6, reviews: 11, image: '/images/products/rc-07.png', icon: 'Bike', hue: 'hue-teal' },
  { id: 'rc-08', category: 'rc', sub: 'Monster Trucks', name: 'RC Monster Truck', price: 3299, rating: 4.7, reviews: 21, image: '/images/products/rc-08.png', icon: 'Truck', hue: 'hue-red-dark' },
];

export const findProduct = (id) => PRODUCTS.find((p) => p.id === id);

export const productsByCategory = (categoryId) => PRODUCTS.filter((p) => p.category === categoryId);
