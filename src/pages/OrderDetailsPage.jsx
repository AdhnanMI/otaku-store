import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Package,
    CalendarDays,
    MapPin,
    CreditCard,
    ArrowLeft,
    CheckCircle2,
    Copy,
} from 'lucide-react';

import Layout from '../components/Layout';
import Breadcrumb from '../components/Breadcrumb';
import { apiFetch } from '../api/api';
import './OrderDetailsPage.css';

function OrderDetailsSkeleton() {
    return (
        <div className="order-details-skeleton">
            {/* Header */}
            <div className="order-details-skeleton-header">
                <div>
                    <span className="skeleton order-details-skeleton-eyebrow" />
                    <span className="skeleton order-details-skeleton-title" />
                    <span className="skeleton order-details-skeleton-number" />
                </div>

                <span className="skeleton order-details-skeleton-status" />
            </div>

            <div className="order-details-grid">

                {/* LEFT COLUMN */}
                <div>
                    {/* Order Information */}
                    <div className="card order-details-card">
                        <span className="skeleton order-details-skeleton-card-title" />

                        <div className="order-details-skeleton-info">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div
                                    className="order-details-skeleton-info-item"
                                    key={i}
                                >
                                    <span className="skeleton order-details-skeleton-label" />
                                    <span className="skeleton order-details-skeleton-value" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Items */}
                    <div
                        className="card order-details-card"
                        style={{ marginTop: 20 }}
                    >
                        <span className="skeleton order-details-skeleton-card-title" />

                        <div className="order-details-skeleton-items">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                    className="order-details-skeleton-item"
                                    key={i}
                                >
                                    <span className="skeleton order-details-skeleton-item-image" />

                                    <div className="order-details-skeleton-item-content">
                                        <span className="skeleton order-details-skeleton-item-name" />
                                        <span className="skeleton order-details-skeleton-item-meta" />
                                    </div>

                                    <span className="skeleton order-details-skeleton-item-total" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div
                        className="card order-details-card"
                        style={{ marginTop: 20 }}
                    >
                        <span className="skeleton order-details-skeleton-card-title" />

                        <div className="order-details-skeleton-address">
                            <span className="skeleton order-details-skeleton-address-icon" />

                            <div>
                                <span className="skeleton order-details-skeleton-address-name" />
                                <span className="skeleton order-details-skeleton-address-line" />
                                <span className="skeleton order-details-skeleton-address-line short" />
                                <span className="skeleton order-details-skeleton-address-line shorter" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div>
                    {/* Summary */}
                    <div className="card order-details-card">
                        <span className="skeleton order-details-skeleton-card-title" />

                        <div className="order-details-skeleton-summary">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div
                                    className="order-details-skeleton-summary-row"
                                    key={i}
                                >
                                    <span className="skeleton" />
                                    <span className="skeleton" />
                                </div>
                            ))}

                            <div className="order-details-skeleton-summary-total">
                                <span className="skeleton" />
                                <span className="skeleton" />
                            </div>
                        </div>
                    </div>

                    {/* Payment */}
                    <div
                        className="card order-details-card"
                        style={{ marginTop: 20 }}
                    >
                        <span className="skeleton order-details-skeleton-card-title" />

                        <div className="order-details-skeleton-payment">
                            <span className="skeleton order-details-skeleton-payment-icon" />

                            <div>
                                <span className="skeleton order-details-skeleton-payment-label" />
                                <span className="skeleton order-details-skeleton-payment-value" />
                            </div>
                        </div>
                    </div>

                    {/* Back button */}
                    <span className="skeleton order-details-skeleton-back" />
                </div>

            </div>
        </div>
    );
}
export default function OrderDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const copyOrderId = async () => {

        const orderId = order.orderNumber;

        try {
            await navigator.clipboard.writeText(orderId);
        } catch (error) {
            console.error('Failed to copy order ID:', error);
        }
    };

    const loadOrder = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await apiFetch(`/orders/${id}`);
            setOrder(data.order);
        } catch (error) {
            if (error.status === 404) {
                setOrder(null);
            } else {
                console.error('Failed to load order:', error);
                setError(error);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrder();
    }, [id]);

    if (loading) {
        return (
            <Layout>
                <div className="page-container order-details-page">
                    <OrderDetailsSkeleton />
                </div>
            </Layout>
        );
    }
    if (error) {
        return (
            <Layout>
                <div className="page-container order-details-page">
                    <Breadcrumb
                        items={[
                            { label: 'Home', to: '/' },
                            { label: 'My Orders', to: '/orders' },
                            { label: 'Order Details' },
                        ]}
                    />

                    <div className="order-details-error card">
                        <h2>Unable to load order</h2>
                        <p>
                            We couldn't load this order right now.
                            Please try again later.
                        </p>

                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={loadOrder}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }
    if (!order) {
        return (
            <Layout>
                <div className="page-container order-details-page">
                    <div className="order-details-error">
                        <Package size={46} />
                        <h1>Order Not Found</h1>
                        <p>
                            This order could not be found or you don't have access to it.
                        </p>

                        <button
                            className="btn btn-primary"
                            onClick={() => navigate('/orders')}
                        >
                            <ArrowLeft size={16} />
                            Back to Orders
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    const formattedDate = new Date(order.createdAt).toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const status = order.status?.toLowerCase() || 'pending';

    return (
        <Layout>
            <div className="page-container order-details-page">

                <Breadcrumb
                    items={[
                        { label: 'Home', to: '/' },
                        { label: 'My Orders', to: '/orders' },
                        { label: order.orderNumber },
                    ]}
                />

                {/* Header */}
                <div className="order-details-header">
                    <div>
                        <p className="order-details-eyebrow">
                            Order Details
                        </p>

                        <h1 className="order-details-title">
                            Your <span className="highlight">Order</span>
                        </h1>

                        <p className="order-details-info-value">
                            {order.orderNumber}
                        </p>
                    </div>

                    <div className="order-details-status">
                        <span className="order-details-status-dot" />
                        {order.status}
                    </div>
                </div>

                <div className="order-details-grid">

                    {/* LEFT COLUMN */}
                    <div>

                        {/* Order information */}
                        <div className="card order-details-card">
                            <h2 className="order-details-card-title">
                                <Package size={19} />
                                Order Information
                            </h2>

                            <div className="order-details-info">

                                <div className="order-details-info-item">
                                    <span className="order-details-info-label">
                                        Order ID
                                    </span>

                                    <button
                                        type="button"
                                        className="order-id-copy"
                                        onClick={copyOrderId}
                                        title="Click to copy order ID"
                                    >
                                        <span>{order.orderNumber}</span>
                                        <Copy size={14} />
                                    </button>

                                    <span className="order-id-copy-hint">
                                        Click to copy
                                    </span>
                                </div>

                                <div className="order-details-info-item">
                                    <span className="order-details-info-label">
                                        Order Date
                                    </span>
                                    <p className="order-details-info-value">
                                        {formattedDate}
                                    </p>
                                </div>

                                <div className="order-details-info-item">
                                    <span className="order-details-info-label">
                                        Items
                                    </span>
                                    <p className="order-details-info-value">
                                        {order.items.length}{' '}
                                        {order.items.length === 1 ? 'Item' : 'Items'}
                                    </p>
                                </div>

                                <div className="order-details-info-item">
                                    <span className="order-details-info-label">
                                        Status
                                    </span>
                                    <p className="order-details-info-value">
                                        {order.status}
                                    </p>
                                </div>

                            </div>
                        </div>

                        {/* Products */}
                        <div className="card order-details-card" style={{ marginTop: 20 }}>
                            <h2 className="order-details-card-title">
                                <Package size={19} />
                                Order Items
                            </h2>

                            <div className="order-details-items">
                                {order.items.map((item) => (
                                    <div
                                        className="order-details-item"
                                        key={item.id}
                                    >
                                        <div className="order-details-item-image">
                                            <Package size={22} />
                                        </div>

                                        <div className="order-details-item-content">
                                            <p className="order-details-item-name">
                                                {item.name}
                                            </p>

                                            <p className="order-details-item-meta">
                                                ₹{item.price.toLocaleString('en-IN')} × {item.qty}
                                            </p>
                                        </div>

                                        <span className="order-details-item-total">
                                            ₹{(item.price * item.qty).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipping Address */}
                        <div className="card order-details-card" style={{ marginTop: 20 }}>
                            <h2 className="order-details-card-title">
                                <MapPin size={19} />
                                Shipping Address
                            </h2>

                            <div className="order-details-address">

                                <div className="order-details-address-icon">
                                    <MapPin size={18} />
                                </div>

                                <div>
                                    <p className="order-details-address-name">
                                        {order.fullName}
                                    </p>

                                    <p className="order-details-address-text">
                                        {order.addressLine1}
                                        {order.addressLine2
                                            ? `, ${order.addressLine2}`
                                            : ''}
                                        <br />
                                        {order.city}, {order.state} - {order.pincode}
                                        <br />
                                        {order.phone}
                                    </p>
                                </div>

                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN */}
                    <div>

                        {/* Price Summary */}
                        <div className="card order-details-card">
                            <h2 className="order-details-card-title">
                                <CreditCard size={19} />
                                Order Summary
                            </h2>

                            <div className="order-details-summary">

                                <div className="order-details-summary-row">
                                    <span>Subtotal</span>
                                    <span>
                                        ₹{order.subtotal.toLocaleString('en-IN')}
                                    </span>
                                </div>

                                <div className="order-details-summary-row discount">
                                    <span>Discount</span>
                                    <span>
                                        - ₹{order.discount.toLocaleString('en-IN')}
                                    </span>
                                </div>

                                <div className="order-details-summary-row">
                                    <span>Delivery</span>
                                    <span>
                                        ₹{order.delivery.toLocaleString('en-IN')}
                                    </span>
                                </div>

                                <div className="order-details-summary-row">
                                    <span>GST</span>
                                    <span>
                                        ₹{order.gst.toLocaleString('en-IN')}
                                    </span>
                                </div>

                                <div className="order-details-summary-total">
                                    <span>Total</span>
                                    <span>
                                        ₹{order.total.toLocaleString('en-IN')}
                                    </span>
                                </div>

                            </div>
                        </div>

                        {/* Payment */}
                        <div
                            className="card order-details-card"
                            style={{ marginTop: 20 }}
                        >
                            <h2 className="order-details-card-title">
                                <CreditCard size={19} />
                                Payment
                            </h2>

                            <div className="order-details-payment">

                                <div className="order-details-payment-method">
                                    <div className="order-details-payment-icon">
                                        <CreditCard size={18} />
                                    </div>

                                    <div>
                                        <p className="order-details-payment-label">
                                            Payment Method
                                        </p>

                                        <p className="order-details-payment-value">
                                            UPI
                                        </p>
                                    </div>
                                </div>

                                {status === 'paid' && (
                                    <span className="order-details-paid">
                                        <CheckCircle2
                                            size={12}
                                            style={{
                                                verticalAlign: 'middle',
                                                marginRight: 4,
                                            }}
                                        />
                                        PAID
                                    </span>
                                )}

                            </div>
                        </div>

                        {/* Back */}
                        <button
                            className="btn btn-outline order-details-back"
                            onClick={() => navigate('/orders')}
                        >
                            <ArrowLeft size={16} />
                            Back to My Orders
                        </button>

                    </div>

                </div>
            </div>
        </Layout>
    );
}