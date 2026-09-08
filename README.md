# Otaku Store — React Rebuild

A React (Vite) recreation of the Otaku Store mockups: Landing, Products, Cart,
Wishlist, Search Results, Login/Sign Up, and Order Tracking — each with a
built-in **Dark / White theme toggle** (sun/moon icon in the navbar) instead
of separate dark/light files, so every page supports both themes live.

> Product photography in your screenshots (Naruto, Attack on Titan, Jujutsu
> Kaisen, etc.) is copyrighted anime artwork, so real character images were
> **not** reproduced. Every product card uses a clean icon + gradient
> placeholder in their place — swap in your own licensed/product photography
> before shipping (see "Adding real images" below).

## Getting started

```bash
npm install
npm run dev       # http://localhost:5173
```

```bash
npm run build      # production build -> dist/
npm run preview    # preview the production build
```

## Project structure

```
src/
  components/       Navbar, Footer, ProductCard, MobileBottomNav, Layout, etc.
  context/
    ThemeContext.jsx   dark/white theme toggle (adds/removes `dark` class on <html>)
    StoreContext.jsx   cart + wishlist state, shared across all pages
  data/
    products.js        mock product catalog (edit/replace with real data or an API)
  pages/
    LandingPage.jsx
    ProductsPage.jsx
    CartPage.jsx
    WishlistPage.jsx
    SearchResultsPage.jsx
    SignAndLoginPage.jsx
    TrackingPage.jsx
  App.jsx             React Router routes
```

Routes:

| Path              | Page               |
|--------------------|--------------------|
| `/`                 | Landing            |
| `/products`         | Products           |
| `/cart`              | Cart               |
| `/wishlist`          | Wishlist           |
| `/search?q=...`      | Search Results     |
| `/login`             | Sign Up / Login    |
| `/track`             | Order Tracking     |

## How theming works

This project uses **plain CSS** — no Tailwind, no build-time utility framework.
`ThemeContext` toggles a `dark` class on `<html>`. All colors are defined once
as CSS custom properties in `src/index.css`:

```css
:root { --color-bg: #fafafa; --color-red: #e4342a; /* ...light theme values */ }
.dark { --color-bg: #0a0a0a; /* ...dark theme overrides */ }
```

Every component's own `.css` file (e.g. `Navbar.css`, `ProductCard.css`)
just references these variables (`background: var(--color-bg)`), so editing
the theme is as simple as changing the values in `src/index.css` — no
`dark:` prefixes to hunt down anywhere.

Each component/page has a matching CSS file next to it (`Navbar.jsx` +
`Navbar.css`, `CartPage.jsx` + `CartPage.css`, etc.), imported directly at
the top of the file. Class names are plain, semantic, and BEM-ish
(`.cart-item-row`, `.wishlist-card-heart`) so you can find and edit styles
easily — everything is regular CSS, editable in any editor without needing
to know a utility-class framework.

## Adding real product images

Right now `ProductThumb.jsx` renders a gradient + icon placeholder driven by
each product's `icon`/`hue` fields in `src/data/products.js` (gradients are
defined as `.hue-*` classes in `ProductThumb.css`). To use real photos: add
an `image` field per product (e.g. `image: '/products/naruto-tee.png'`
placed in `public/products/`), then swap `<ProductThumb .../>` for an
`<img src={product.image} className="product-thumb" style={{ objectFit: 'cover' }} />`
in `ProductCard.jsx`, `CartPage.jsx`, `WishlistPage.jsx`, and `TrackingPage.jsx`.

## Wiring up a backend

Cart/wishlist/search currently run entirely on mock local state
(`StoreContext.jsx`, `data/products.js`). To connect a real backend:
- Replace `PRODUCTS` in `data/products.js` with a fetch/query to your API.
- Swap the `useState` calls in `StoreContext.jsx` for API calls (add/remove
  cart & wishlist items), keeping the same context shape so pages don't change.
- The Sign Up / Login form in `SignAndLoginPage.jsx` is UI-only — hook the
  `onSubmit` handlers up to your auth endpoint.
