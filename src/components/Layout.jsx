import Navbar from './Navbar';
import Footer from './Footer';
import MobileBottomNav from './MobileBottomNav';
import './Layout.css';

export default function Layout({ children, showSearch = true }) {
  return (
    <div className="app-shell">
      <Navbar showSearch={showSearch} />
      <main className="app-shell-main">{children}</main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
