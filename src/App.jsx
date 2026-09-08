import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { StoreProvider } from './context/StoreContext';
import LandingPage from './pages/LandingPage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import SearchResultsPage from './pages/SearchResultsPage';
import SignAndLoginPage from './pages/SignAndLoginPage';
import TrackingPage from './pages/TrackingPage';
import PaymentPage from './pages/PaymentPage';
import ScrollToTop from './components/ScrollToTop';
import ProductModal from './components/ProductModal';
import AccountPage from './pages/AccountPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailsPage from './pages/OrderDetailsPage';
import AdminPage from './pages/AdminPage';
import AdminRoute from './components/AdminRoute';

export default function App() {
  return (
    <ThemeProvider>
      <StoreProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              }
            />
            <Route path="/orders/:id" element={<OrderDetailsPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/" element={<LandingPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path="/login" element={<SignAndLoginPage />} />
            <Route path="/track/:id" element={<TrackingPage />} />
            <Route path="/track" element={<TrackingPage />} />
            <Route path="/payment" element={<PaymentPage />} />
          </Routes>
          <ProductModal />
        </BrowserRouter>
      </StoreProvider>
    </ThemeProvider>
  );
}
