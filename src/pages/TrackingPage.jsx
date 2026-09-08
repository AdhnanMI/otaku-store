import { useEffect, useState } from 'react';
import { Package, ArrowRight, Copy, MapPin, Truck, CheckCircle2, Headphones, Boxes, Home as HomeIcon, Bike } from 'lucide-react';
import Layout from '../components/Layout';
import Breadcrumb from '../components/Breadcrumb';
import ProductThumb from '../components/ProductThumb';
import './TrackingPage.css';
import { useNavigate, useParams } from 'react-router-dom';
import { apiFetch } from '../api/api';
import ConfirmDialog from '../components/ConfirmDialog';
import { useStore } from '../context/StoreContext';

const STEPS = [
  {
    key: 'confirmed',
    label: 'Order Confirmed',
    copy: 'Your order has been placed successfully.',
    icon: Package,
  },
  {
    key: 'paid',
    label: 'Payment Confirmed',
    copy: 'Your payment has been successfully verified.',
    icon: CheckCircle2,
  },
  {
    key: 'shipped',
    label: 'Shipped',
    copy: 'Your order has been handed over to the delivery partner.',
    icon: Truck,
  },
  {
    key: 'out',
    label: 'Out for Delivery',
    copy: 'Your package is on the way to your address.',
    icon: Bike,
  },
  {
    key: 'delivered',
    label: 'Delivered',
    copy: 'Your order has been delivered successfully.',
    icon: HomeIcon,
  },
];

const getActiveStep = (status) => {
  switch (status) {
    case 'PLACED':
      return 0;

    case 'PAID':
      return 1;

    case 'SHIPPED':
      return 2;

    case 'DELIVERED':
      return 4;

    case 'CANCELLED':
      return 0;

    default:
      return 0;
  }
};
const getStatusInfo = (status) => {
  switch (status) {
    case 'PLACED':
      return {
        icon: Package,
        title: 'Order confirmed',
        copy: 'Your order has been placed and is waiting for payment confirmation.',
      };

    case 'PAID':
      return {
        icon: CheckCircle2,
        title: 'Payment confirmed',
        copy: 'Your payment has been successfully verified. Your order is being prepared.',
      };

    case 'SHIPPED':
      return {
        icon: Truck,
        title: 'Your order is on the way',
        copy: 'Your package has been handed over to the delivery partner.',
      };

    case 'DELIVERED':
      return {
        icon: HomeIcon,
        title: 'Order delivered',
        copy: 'Your package has been delivered successfully. Enjoy your order!',
      };

    case 'CANCELLED':
      return {
        icon: Package,
        title: 'Order cancelled',
        copy: 'This order has been cancelled.',
      };

    default:
      return {
        icon: Package,
        title: 'Order confirmed',
        copy: 'Your order status is being updated.',
      };
  }
};
export default function TrackingPage() {
  const { user, authLoading } = useStore();

  const [orderId, setOrderId] = useState('');
  const [loginRequiredOpen, setLoginRequiredOpen] = useState(false);
  const [tracked, setTracked] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    const loadOrder = async () => {
      setLoading(true);
      setError('');
      setOrder(null);

      try {
        const data = await apiFetch(`/orders/${id}`);
        setOrder(data.order);
      } catch (error) {
        console.error('Failed to load tracking order:', error);

        setError(
          'We couldn’t find an order with this Order ID. Please check the order number and try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (authLoading) return;

    if (!user) {
      setLoading(false);
      setLoginRequiredOpen(true);
      return;
    }

    if (id) {
      loadOrder();
    }
  }, [id, user, authLoading]);
  const statusInfo = getStatusInfo(order?.status);
  const StatusIcon = statusInfo.icon;
  return (
    <Layout>
      <div className="page-container">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Track Products' }]} />

        <div className="track-hero">
          <div className="track-hero-text">
            <p className="track-eyebrow">Stay Updated</p>
            <h1 className="track-title">
              Track Your <span className="highlight">Order</span>
            </h1>
            <p className="track-copy">Enter your Order ID / Tracking ID to get real-time updates on your order.</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();

                const value = orderId.trim();

                if (!value) return;

                navigate(`/track/${encodeURIComponent(value)}`);
              }}
              className="track-form"
            >
              <div className="track-input-wrap">
                <Package size={16} />
                <input value={orderId} onChange={(e) => setOrderId(e.target.value)} type="text" placeholder="Enter Order ID / Tracking ID" className="track-input" />
              </div>
              <button className="btn btn-primary track-submit-btn">
                Track Order <ArrowRight size={16} />
              </button>
            </form>
            <p className="track-example">Example: OTAKU123456</p>

            <div className="track-steps-mini">
              <span className="track-steps-mini-item">
                <Boxes size={18} /> Your Order
              </span>
              <ArrowRight size={14} className="chevron" />
              <span className="track-steps-mini-item">
                <Truck size={18} /> On the Move
              </span>
              <ArrowRight size={14} className="chevron" />
              <span className="track-steps-mini-item">
                <HomeIcon size={18} /> To Your Hands
              </span>
            </div>
          </div>
          <div className="track-hero-art">
            <div className="track-hero-art-circle">
              <Truck size={64} strokeWidth={1.25} />
            </div>
          </div>
        </div>
        {tracked && loading && (
          <div className="card track-loading-card">
            <div className="track-loading-spinner" />
            <div>
              <h2>Finding Your Order...</h2>
              <p>We're checking your order details. Please wait.</p>
            </div>
          </div>
        )}
        {tracked && error && (
          <div className="card track-error-card">
            <div className="track-error-icon">
              <Package size={28} />
            </div>

            <div>
              <h2>Order Not Found</h2>
              <p>{error}</p>
            </div>
          </div>
        )}

        {tracked && order && (
          <>
            <div className="card track-details-card">
              <h2 className="track-details-title">Order Details</h2>

              <div className="track-details-grid">

                <div className="track-product-row">
                  <div className="track-product-thumb">
                    <ProductThumb
                      icon="Package"
                      hue="hue-indigo"
                    />
                  </div>

                  <div className="track-product-content">
                    <p className="track-product-meta">PACKAGE</p>

                    <div className="track-product-names">
                      {order?.items?.map((item) => (
                        <p className="track-product-name" key={item.id}>
                          {item.name} <span>× {item.qty}</span>
                        </p>
                      ))}
                    </div>

                    <p className="track-product-meta">
                      {order?.items?.reduce((total, item) => total + item.qty, 0)}{' '}
                      {order?.items?.reduce((total, item) => total + item.qty, 0) === 1
                        ? 'item'
                        : 'items'}
                    </p>

                    <p className="track-product-price">
                      ₹{order?.total?.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="track-detail-label">Order ID</p>

                  <p className="track-detail-id">
                    {order?.orderNumber}
                    <Copy size={12} />
                  </p>

                  <p className="track-detail-label track-detail-spacer">
                    Order Placed
                  </p>

                  <p className="track-detail-value">
                    {order?.createdAt
                      ? new Date(order.createdAt).toLocaleString('en-IN')
                      : '-'}
                  </p>

                  <p className="track-detail-label track-detail-spacer">
                    Payment Status
                  </p>

                  <p className="track-detail-value">
                    {order?.status || '-'}
                  </p>
                </div>

                <div>
                  <p className="track-detail-label">
                    Shipping Address
                  </p>

                  <p className="track-detail-value">
                    {order?.fullName}
                  </p>

                  <p className="track-product-meta">
                    {order?.addressLine1}
                    {order?.addressLine2
                      ? `, ${order.addressLine2}`
                      : ''}
                    <br />
                    {order?.city}, {order?.state} - {order?.pincode}
                  </p>

                  <p className="track-product-meta">
                    {order?.phone}
                  </p>
                </div>

                <div>
                  <p className="track-detail-label">
                    Payment Method
                  </p>

                  <p className="track-detail-value">
                    UPI
                  </p>

                  <p className="track-detail-label track-detail-spacer">
                    Amount
                  </p>

                  <p className="track-detail-value">
                    ₹{order?.total?.toLocaleString('en-IN')}
                  </p>
                </div>

              </div>
            </div>

            <div className="card track-status-card">
              <div className="track-status-head">
                <h2 className="track-details-title">Order Tracking Status</h2>
                <span className="track-live-badge">
                  <span className="track-live-dot" /> Live Tracking
                </span>
              </div>

              <div className="track-timeline-desktop">
                <div className="track-timeline-track">
                  <div className="track-timeline-bg-line" />
                  <div className="track-timeline-progress-line" style={{
                    width: `${(getActiveStep(order.status) / (STEPS.length - 1)) * 100}%`,
                  }} />
                  {STEPS.map((step, i) => {
                    const Icon = step.icon;
                    const done = i <= getActiveStep(order.status);
                    return (
                      <div key={step.key} className="track-timeline-step">
                        <span
                          className={`track-timeline-icon ${done ? 'done' : ''
                            } ${i === getActiveStep(order.status) ? 'current' : ''}`}
                        >
                          <Icon size={18} />
                        </span>
                        <p className="track-timeline-label">{step.label}</p>
                        <p className="track-timeline-copy">{step.copy}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="track-timeline-mobile">
                {STEPS.map((step, i) => {
                  const Icon = step.icon;
                  const done = i <= getActiveStep(order.status);
                  const isLast = i === STEPS.length - 1;
                  return (
                    <div key={step.key} className="track-timeline-mobile-row">
                      {!isLast && <span className={`track-timeline-mobile-line ${done ? 'done' : ''}`} />}
                      <span
                        className={`track-timeline-mobile-icon ${done ? 'done' : ''
                          } ${i === getActiveStep(order.status) ? 'current' : ''}`}
                      >
                        <Icon size={18} />
                      </span>
                      <div>
                        <p className="track-timeline-mobile-label">{step.label}</p>
                        <p className="track-timeline-mobile-copy">{step.copy}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={`track-status-banner status-${order.status?.toLowerCase()}`}>
                <div className="track-status-banner-left">
                  <StatusIcon size={22} />

                  <div>
                    <p className="track-status-banner-title">
                      {statusInfo.title}
                    </p>

                    <p className="track-status-banner-copy">
                      {statusInfo.copy}
                    </p>
                  </div>
                </div>

                {order.status === 'SHIPPED' && (
                  <button className="track-status-map-btn">
                    <MapPin size={14} />
                    View on Map
                  </button>
                )}
              </div>
            </div>

            <div className="card track-help-card">
              <div className="track-help-left">
                <Headphones size={20} />
                <div>
                  <p className="track-help-title">Need Help?</p>
                  <p className="track-help-copy">If you have any issues with your order, our support team is here to help.</p>
                </div>
              </div>
              <button className="track-help-btn">Contact Support →</button>
            </div>
          </>
        )}
      </div>
      <ConfirmDialog
        open={loginRequiredOpen}
        title="Login required"
        message="You are not logged in. Please log in to track your order."
        confirmLabel="OK"
        cancelLabel="Cancel"
        onConfirm={() => setLoginRequiredOpen(false)}
        onCancel={() => setLoginRequiredOpen(false)}
      />
    </Layout>
  );
}
