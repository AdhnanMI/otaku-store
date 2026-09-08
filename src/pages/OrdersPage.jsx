import { useEffect, useState } from 'react';
import { Package, Eye, CalendarDays, IndianRupee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Breadcrumb from '../components/Breadcrumb';
import { apiFetch } from '../api/api';
import ConfirmDialog from '../components/ConfirmDialog';
import { useStore } from '../context/StoreContext';
import './OrdersPage.css';
function OrdersSkeleton() {
    return (
        <div className="orders-list orders-skeleton-list">
            {Array.from({ length: 3 }).map((_, i) => (
                <div className="card order-card order-card-skeleton" key={i}>
                    <div className="order-card-header">
                        <div className="order-number">
                            <span className="skeleton skeleton-order-icon" />

                            <div className="skeleton-order-heading">
                                <span className="skeleton skeleton-order-label" />
                                <span className="skeleton skeleton-order-number" />
                            </div>
                        </div>

                        <span className="skeleton skeleton-order-status" />
                    </div>

                    <div className="order-card-info">
                        <div>
                            <span className="skeleton skeleton-info-icon" />
                            <div>
                                <span className="skeleton skeleton-info-label" />
                                <strong className="skeleton skeleton-info-value" />
                            </div>
                        </div>

                        <div>
                            <span className="skeleton skeleton-info-icon" />
                            <div>
                                <span className="skeleton skeleton-info-label" />
                                <strong className="skeleton skeleton-info-value short" />
                            </div>
                        </div>

                        <div>
                            <span className="skeleton skeleton-info-icon" />
                            <div>
                                <span className="skeleton skeleton-info-label" />
                                <strong className="skeleton skeleton-info-value price" />
                            </div>
                        </div>
                    </div>

                    <div className="order-card-products">
                        {Array.from({ length: 2 }).map((_, j) => (
                            <div className="order-item" key={j}>
                                <span className="skeleton skeleton-item-image" />

                                <div className="skeleton-item-text">
                                    <span className="skeleton skeleton-item-name" />
                                    <span className="skeleton skeleton-item-meta" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="order-card-footer">
                        <span className="skeleton skeleton-footer-text" />
                        <span className="skeleton skeleton-view-button" />
                    </div>
                </div>
            ))}
        </div>
    );
}
export default function OrdersPage() {
    const { user, authLoading } = useStore();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loginRequiredOpen, setLoginRequiredOpen] = useState(false);

    const navigate = useNavigate();
    const loadOrders = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await apiFetch('/orders');
            setOrders(data.orders);
        } catch (error) {
            console.error('Failed to load orders:', error);
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            setLoading(false);
            setLoginRequiredOpen(true);
            return;
        }

        loadOrders();
    }, [user, authLoading]);
    if (loading) {
        return (
            <Layout>
                <div className="page-container orders-page">
                    <Breadcrumb
                        items={[
                            { label: 'Home', to: '/' },
                            { label: 'My Orders' },
                        ]}
                    />

                    <div className="orders-header">
                        <div>
                            <span className="skeleton skeleton-header-eyebrow" />
                            <span className="skeleton skeleton-header-title" />
                            <span className="skeleton skeleton-header-subtitle" />
                        </div>

                        <span className="skeleton skeleton-orders-count" />
                    </div>

                    <OrdersSkeleton />
                </div>
            </Layout>
        );
    }
    if (error) {
        return (
            <Layout>
                <div className="page-container orders-page">
                    <Breadcrumb
                        items={[
                            { label: 'Home', to: '/' },
                            { label: 'My Orders' },
                        ]}
                    />

                    <div className="orders-error card">
                        <h2>Unable to load orders</h2>
                        <p>
                            We couldn't load your orders right now.
                            Please try again later.
                        </p>

                        <button
                            className="btn btn-primary"
                            onClick={loadOrders}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }
    return (
        <Layout>
            <div className="page-container orders-page">
                <Breadcrumb
                    items={[
                        { label: 'Home', to: '/' },
                        { label: 'My Orders' },
                    ]}
                />

                <div className="orders-header">
                    <div>
                        <p className="orders-eyebrow">Your Purchases</p>
                        <h1 className="orders-title">
                            My <span className="highlight">Orders</span>
                        </h1>
                        <p className="orders-subtitle">
                            View and track all your previous orders.
                        </p>
                    </div>

                    <div className="orders-count">
                        <Package size={18} />
                        <span>{orders.length} {orders.length === 1 ? 'Order' : 'Orders'}</span>
                    </div>
                </div>

                {orders.length === 0 ? (
                    <div className="orders-empty card">
                        <Package size={48} />
                        <h2>No Orders Yet</h2>
                        <p>
                            You haven't placed any orders yet. Start shopping and your
                            orders will appear here.
                        </p>
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/products')}
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map((order) => (
                            <div className="card order-card" key={order.id}>
                                <div className="order-card-header">
                                    <div className="order-number">
                                        <div className="order-icon">
                                            <Package size={20} />
                                        </div>

                                        <div>
                                            <p className="order-label">Order ID</p>
                                            <h2>{order.orderNumber}</h2>
                                        </div>
                                    </div>

                                    <span className={`order-status status-${order.status?.toLowerCase()}`}>
                                        {order.status}
                                    </span>
                                </div>

                                <div className="order-card-info">
                                    <div>
                                        <CalendarDays size={16} />
                                        <div>
                                            <span>Order Date</span>
                                            <strong>
                                                {new Date(order.createdAt).toLocaleDateString(
                                                    'en-IN',
                                                    {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    }
                                                )}
                                            </strong>
                                        </div>
                                    </div>

                                    <div>
                                        <Package size={16} />
                                        <div>
                                            <span>Items</span>
                                            <strong>
                                                {order.items.length}{' '}
                                                {order.items.length === 1 ? 'Item' : 'Items'}
                                            </strong>
                                        </div>
                                    </div>

                                    <div>
                                        <IndianRupee size={16} />
                                        <div>
                                            <span>Total</span>
                                            <strong>₹{order.total}</strong>
                                        </div>
                                    </div>
                                </div>

                                <div className="order-card-products">
                                    {order.items.slice(0, 3).map((item) => (
                                        <div className="order-item" key={item.id}>
                                            <div className="order-item-placeholder">
                                                <Package size={18} />
                                            </div>

                                            <div>
                                                <p>{item.name}</p>
                                                <span>
                                                    Qty: {item.qty} · ₹{item.price}
                                                </span>
                                            </div>
                                        </div>
                                    ))}

                                    {order.items.length > 3 && (
                                        <p className="order-more-items">
                                            +{order.items.length - 3} more items
                                        </p>
                                    )}
                                </div>

                                <div className="order-card-footer">
                                    <span>
                                        {order.status === 'PAID'
                                            ? 'Payment confirmed'
                                            : 'Payment pending'}
                                    </span>

                                    <button
                                        className="order-view-btn"
                                        onClick={() => navigate(`/orders/${order.id}`)}
                                    >
                                        <Eye size={16} />
                                        View Order
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <ConfirmDialog
                open={loginRequiredOpen}
                title="Login required"
                message="You are not logged in. Please log in to view your orders."
                confirmLabel="OK"
                cancelLabel="Cancel"
                onConfirm={() => setLoginRequiredOpen(false)}
                onCancel={() => setLoginRequiredOpen(false)}
            />
        </Layout>
    );
}