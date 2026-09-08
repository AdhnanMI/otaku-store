import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import {
  QrCode,
  Copy,
  Check,
  Smartphone,
  ShieldCheck,
  ChevronLeft,
  PackageCheck,
  MapPin,
  UploadCloud,
  ImageOff,
  Image as ImageIcon,
} from 'lucide-react';
import Layout from '../components/Layout';
import Breadcrumb from '../components/Breadcrumb';
import { useStore } from '../context/StoreContext';
import './PaymentPage.css';
import { apiFetch } from '../api/api';

const PAYEE_VPA = 'otakustore@upi';
const PAYEE_NAME = 'Otaku Store';

const UPI_APPS = [
  { name: 'Google Pay', prefix: 'tez://upi/pay?' },
  { name: 'PhonePe', prefix: 'phonepe://pay?' },
  { name: 'Paytm', prefix: 'paytmmp://pay?' },
  { name: 'Any UPI App', prefix: 'upi://pay?' },
];

// Stages: 'pay' -> 'proof' -> 'success'
export default function PaymentPage() {
  const {
    orderId,
    orderDbId,
    shippingInfo,
    cartItems,
    subtotal,
    discount,
    delivery,
    gst,
    total,
    clearCart,
    resetOrder,
  } = useStore();
  const navigate = useNavigate();

  const [orderSnapshot] = useState(() => ({
    items: cartItems,
    subtotal,
    discount,
    delivery,
    gst,
    total,
  }));
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [stage, setStage] = useState('pay');
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState('');
  const [proofError, setProofError] = useState('');
  const fileInputRef = useRef(null);

  const upiParams = orderId
    ? `pa=${encodeURIComponent(PAYEE_VPA)}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${orderSnapshot.total}&cu=INR&tn=${encodeURIComponent(
      `Order ${orderId}`
    )}&tr=${encodeURIComponent(orderId)}`
    : '';

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    QRCode.toDataURL(`upi://pay?${upiParams}`, {
      width: 220,
      margin: 1,
      color: { dark: '#171717', light: '#ffffff' },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl('');
      });
    return () => {
      cancelled = true;
    };
  }, [orderId, upiParams]);

  useEffect(() => {
    return () => {
      if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);
    };
  }, [screenshotPreview]);

  if (!orderId) {
    return <Navigate to="/cart" replace />;
  }

  const handleCopyVpa = async () => {
    try {
      await navigator.clipboard.writeText(PAYEE_VPA);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // clipboard unavailable, ignore silently
    }
  };

  const handleIvePaid = () => {
    setStage('proof');
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setProofError('Please upload an image file (screenshot).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setProofError('Image is too large — please upload a file under 8MB.');
      return;
    }
    if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);
    setScreenshot(file);
    setScreenshotPreview(URL.createObjectURL(file));
    setProofError('');
  };

  const handleRemoveScreenshot = () => {
    if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);
    setScreenshot(null);
    setScreenshotPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmitProof = async () => {
    if (!screenshot) {
      setProofError('Please upload your payment screenshot to complete the order.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('screenshot', screenshot);

      await apiFetch(`/orders/${orderDbId}/pay`, {
        method: 'PATCH',
        headers: {
          // Important: don't set Content-Type here.
          // The browser adds the multipart/form-data boundary automatically.
        },
        body: formData,
      });

      setStage('success');
      clearCart();
    } catch (error) {
      console.error('Failed to submit payment proof:', error);
      setProofError(error.message || 'Failed to submit payment proof.');
    }
  };

  const handleContinueShopping = () => {
    resetOrder();
    navigate('/products');
  };

  return (
    <Layout>
      <div className="page-container payment-page">
        <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Cart', to: '/cart' }, { label: 'Payment' }]} />

        {stage === 'success' && (
          <div className="payment-success">
            <span className="payment-success-icon">
              <PackageCheck size={32} />
            </span>
            <h1 className="payment-success-title">Order Placed!</h1>
            <p className="payment-success-copy">Your payment screenshot was received and your order is confirmed.</p>
            <div className="card payment-success-card">
              <div className="payment-success-row">
                <span className="text-muted">Order ID</span>
                <span className="payment-success-order-id">{orderId}</span>
              </div>
              <div className="payment-success-row">
                <span className="text-muted">Amount Paid</span>
                <span className="payment-success-amount">₹{orderSnapshot.total.toLocaleString('en-IN')}</span>
              </div>
              <div className="payment-success-row">
                <span className="text-muted">Payment Method</span>
                <span>UPI</span>
              </div>
              {shippingInfo && (
                <div className="payment-success-address">
                  <MapPin size={14} />
                  <div>
                    <p className="payment-success-address-name">{shippingInfo.fullName}</p>
                    <p className="text-muted">
                      {shippingInfo.addressLine1}
                      {shippingInfo.addressLine2 ? `, ${shippingInfo.addressLine2}` : ''}, {shippingInfo.city}, {shippingInfo.state} - {shippingInfo.pincode}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="payment-success-actions">
              <button className="btn btn-primary" onClick={handleContinueShopping}>
                Continue Shopping
              </button>
              <Link to="/track" className="btn btn-outline">
                Track Order
              </Link>
            </div>
          </div>
        )}

        {stage === 'proof' && (
          <div className="payment-proof">
            <div className="payment-header">
              <h1 className="payment-title">Confirm Your Payment</h1>
              <p className="payment-subtitle">Order {orderId} · Upload a screenshot of your UPI payment to complete the order</p>
            </div>

            <div className="card payment-proof-card">
              <div className="payment-proof-amount-row">
                <span className="text-muted">Amount to confirm</span>
                <span className="payment-proof-amount">₹{orderSnapshot.total.toLocaleString('en-IN')}</span>
              </div>

              {screenshotPreview ? (
                <div className="payment-proof-preview">
                  <img src={screenshotPreview} alt="Payment screenshot preview" />
                  <button type="button" className="payment-proof-remove" onClick={handleRemoveScreenshot}>
                    <ImageOff size={14} /> Remove & choose another
                  </button>
                </div>
              ) : (
                <label className="payment-proof-dropzone">
                  <UploadCloud size={26} />
                  <span className="payment-proof-dropzone-title">Upload payment screenshot</span>
                  <span className="payment-proof-dropzone-hint">PNG or JPG, up to 8MB</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="visually-hidden"
                  />
                </label>
              )}

              {proofError && <p className="payment-proof-error">{proofError}</p>}

              <p className="payment-proof-note">
                <ImageIcon size={13} /> We use this to verify your UPI payment against order {orderId}. Your order is placed only after this step.
              </p>

              <div className="payment-proof-actions">
                <button type="button" className="btn btn-outline" onClick={() => setStage('pay')}>
                  <ChevronLeft size={16} /> Back to QR
                </button>
                <button type="button" className="btn btn-primary" onClick={handleSubmitProof}>
                  Submit & Complete Order
                </button>
              </div>
            </div>
          </div>
        )}

        {stage === 'pay' && (
          <>
            <div className="payment-header">
              <h1 className="payment-title">Complete Your Payment</h1>
              <p className="payment-subtitle">Order {orderId} · Pay securely via UPI</p>
            </div>

            <div className="payment-layout">
              <div className="card payment-qr-card">
                <div className="payment-qr-box">
                  {qrDataUrl ? (
                    <img src={qrDataUrl} alt="UPI QR code" />
                  ) : (
                    <div className="payment-qr-loading">
                      <QrCode size={28} />
                    </div>
                  )}
                </div>
                <p className="payment-qr-hint">Scan with any UPI app to pay</p>

                <div className="payment-vpa-row">
                  <span>{PAYEE_VPA}</span>
                  <button onClick={handleCopyVpa} className="payment-vpa-copy" aria-label="Copy UPI ID">
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>

                <div className="payment-divider">
                  <span>or pay using an app</span>
                </div>

                <div className="payment-app-grid">
                  {UPI_APPS.map((app) => (
                    <a key={app.name} href={`${app.prefix}${upiParams}`} className="payment-app-btn">
                      <Smartphone size={15} />
                      {app.name}
                    </a>
                  ))}
                </div>
                <p className="payment-app-note">Opening an app works only on a mobile device with that UPI app installed.</p>

                <button className="btn btn-primary payment-confirm-btn" onClick={handleIvePaid}>
                  <ShieldCheck size={16} /> I've Completed the Payment
                </button>
                <p className="payment-demo-note">This is a demo checkout — no real transaction is made.</p>
              </div>

              <div className="payment-sidebar">
                <div className="card payment-summary-card">
                  <h2 className="payment-summary-title">Order Summary</h2>
                  <div className="payment-summary-items">
                    {orderSnapshot.items.map(({ id, qty, product }) => (
                      <div key={id} className="payment-summary-item">
                        <span className="payment-summary-item-name">
                          {product.name} <span className="text-muted">x{qty}</span>
                        </span>
                        <span>₹{(product.price * qty).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                  <div className="payment-summary-rows">
                    <div className="payment-summary-row">
                      <span className="text-muted">Subtotal</span>
                      <span>₹{orderSnapshot.subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="payment-summary-row discount">
                      <span>Discount</span>
                      <span>- ₹{orderSnapshot.discount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="payment-summary-row">
                      <span className="text-muted">Delivery</span>
                      <span>₹{orderSnapshot.delivery}</span>
                    </div>
                    <div className="payment-summary-row">
                      <span className="text-muted">GST</span>
                      <span>₹{orderSnapshot.gst.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="payment-summary-total">
                    <span>Total</span>
                    <span>₹{orderSnapshot.total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {shippingInfo && (
                  <div className="card payment-address-card">
                    <p className="payment-address-title">
                      <MapPin size={14} /> Deliver To
                    </p>
                    <p className="payment-address-name">{shippingInfo.fullName}</p>
                    <p className="text-muted">
                      {shippingInfo.addressLine1}
                      {shippingInfo.addressLine2 ? `, ${shippingInfo.addressLine2}` : ''}, {shippingInfo.city}, {shippingInfo.state} - {shippingInfo.pincode}
                    </p>
                    <p className="text-muted">+91 {shippingInfo.phone}</p>
                  </div>
                )}

                <Link to="/cart" className="btn btn-outline payment-back-btn">
                  <ChevronLeft size={16} /> Back to Cart
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
