import { useStore } from '../context/StoreContext';
import Navbar from '../components/Navbar';
import {
    User,
    Package,
    Truck,
    LogOut,
    ChevronRight,
} from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import './AccountPage.css';
function AccountSkeleton() {
    return (
        <main className="account-page">
            <div className="account-container account-skeleton">

                {/* Header */}
                <div className="account-header">
                    <span className="skeleton account-skeleton-avatar" />

                    <div className="account-header-info">
                        <span className="skeleton account-skeleton-eyebrow" />
                        <span className="skeleton account-skeleton-title" />
                        <span className="skeleton account-skeleton-email" />
                    </div>
                </div>

                {/* Account actions */}
                <section className="account-section">
                    <span className="skeleton account-skeleton-section-title" />

                    <div className="account-actions">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div className="account-action" key={i}>
                                <span className="skeleton account-skeleton-action-icon" />

                                <div className="account-action-content">
                                    <span className="skeleton account-skeleton-action-title" />
                                    <span className="skeleton account-skeleton-action-text" />
                                </div>

                                <span className="skeleton account-skeleton-arrow" />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Profile */}
                <section className="account-section">
                    <span className="skeleton account-skeleton-section-title" />

                    <div className="account-profile-card">
                        {Array.from({ length: 2 }).map((_, i) => (
                            <div className="account-profile-row" key={i}>
                                <span className="skeleton account-skeleton-profile-icon" />

                                <div>
                                    <span className="skeleton account-skeleton-profile-label" />
                                    <span className="skeleton account-skeleton-profile-value" />
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Logout */}
                <span className="skeleton account-skeleton-logout" />

            </div>
        </main>
    );
}
export default function AccountPage() {
    const { user, setUser, authLoading } = useStore();
    const navigate = useNavigate();

    if (authLoading) {
        return (
            <Layout>
                <AccountSkeleton />
            </Layout>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/');
    };

    return (
        <Layout>
            <main className="account-page">
                <div className="account-container">

                    {/* Header */}
                    <div className="account-header">
                        <div className="account-avatar">
                            {user.name?.charAt(0).toUpperCase()}
                        </div>

                        <div className="account-header-info">
                            <p className="account-eyebrow">
                                My Account
                            </p>

                            <h1>
                                Welcome, <span>{user.name}</span>
                            </h1>

                            <p className="account-email">
                                {user.email}
                            </p>
                        </div>
                    </div>

                    {/* Account actions */}
                    <section className="account-section">
                        <h2>Account</h2>

                        <div className="account-actions">

                            <button
                                className="account-action"
                                onClick={() => navigate('/orders')}
                            >
                                <div className="account-action-icon">
                                    <Package size={20} />
                                </div>

                                <div className="account-action-content">
                                    <strong>My Orders</strong>
                                    <span>
                                        View and track your previous orders
                                    </span>
                                </div>

                                <ChevronRight size={18} />
                            </button>

                            <button
                                className="account-action"
                                onClick={() => navigate('/track')}
                            >
                                <div className="account-action-icon">
                                    <Truck size={20} />
                                </div>

                                <div className="account-action-content">
                                    <strong>Track Order</strong>
                                    <span>
                                        Check the status of your order
                                    </span>
                                </div>

                                <ChevronRight size={18} />
                            </button>

                        </div>
                    </section>

                    {/* Profile */}
                    <section className="account-section">
                        <h2>Profile Information</h2>

                        <div className="account-profile-card">

                            <div className="account-profile-row">
                                <div className="account-profile-icon">
                                    <User size={18} />
                                </div>

                                <div>
                                    <span>Name</span>
                                    <strong>{user.name}</strong>
                                </div>
                            </div>

                            <div className="account-profile-row">
                                <div className="account-profile-icon">
                                    <span>@</span>
                                </div>

                                <div>
                                    <span>Email</span>
                                    <strong>{user.email}</strong>
                                </div>
                            </div>

                        </div>
                    </section>

                    {/* Logout */}
                    <button
                        className="account-logout"
                        onClick={handleLogout}
                    >
                        <LogOut size={18} />
                        Log Out
                    </button>

                </div>
            </main>
        </Layout>
    );
}