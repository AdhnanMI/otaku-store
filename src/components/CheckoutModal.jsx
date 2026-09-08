import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, MapPin, User, Phone, Mail, Building2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import './CheckoutModal.css';

const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const EMPTY_FORM = {
  fullName: '',
  phone: '',
  email: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  pincode: '',
};

export default function CheckoutModal({ open, onClose }) {
  const { placeOrder, total, shippingInfo } = useStore();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm(shippingInfo || EMPTY_FORM);
      setErrors({});
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!form.fullName.trim()) next.fullName = 'Full name is required';
    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) next.phone = 'Enter a valid 10-digit phone number';
    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email.trim())) next.email = 'Enter a valid email';
    if (!form.addressLine1.trim()) next.addressLine1 = 'Address is required';
    if (!form.city.trim()) next.city = 'City is required';
    if (!form.state) next.state = 'Select a state';
    if (!/^\d{6}$/.test(form.pincode.trim())) next.pincode = 'Enter a valid 6-digit pincode';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const order = await placeOrder(form);
    onClose?.();
    navigate('/payment');
  };

  return (
    <div
      className="checkout-modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
    >
      <div className="checkout-modal-panel">
        <button className="checkout-modal-close" onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>

        <div className="checkout-modal-head">
          <span className="checkout-modal-icon">
            <MapPin size={18} />
          </span>
          <div>
            <h2 id="checkout-modal-title" className="checkout-modal-title">Shipping Details</h2>
            <p className="checkout-modal-subtitle">Tell us where to deliver your order</p>
          </div>
        </div>

        <form className="checkout-form" onSubmit={handleSubmit} noValidate>
          <div className="checkout-form-scroll">
            <div className="checkout-field">
              <label className="checkout-field-label">Full Name</label>
              <div className="checkout-input-wrap">
                <User size={15} />
                <input
                  className={`checkout-input with-icon ${errors.fullName ? 'invalid' : ''}`}
                  type="text"
                  placeholder="Rahul Sharma"
                  value={form.fullName}
                  onChange={update('fullName')}
                />
              </div>
              {errors.fullName && <span className="checkout-field-error">{errors.fullName}</span>}
            </div>

            <div className="checkout-field-row">
              <div className="checkout-field">
                <label className="checkout-field-label">Phone Number</label>
                <div className="checkout-input-wrap">
                  <Phone size={15} />
                  <input
                    className={`checkout-input with-icon ${errors.phone ? 'invalid' : ''}`}
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="98765 43210"
                    value={form.phone}
                    onChange={update('phone')}
                  />
                </div>
                {errors.phone && <span className="checkout-field-error">{errors.phone}</span>}
              </div>

              <div className="checkout-field">
                <label className="checkout-field-label">Email (optional)</label>
                <div className="checkout-input-wrap">
                  <Mail size={15} />
                  <input
                    className={`checkout-input with-icon ${errors.email ? 'invalid' : ''}`}
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={update('email')}
                  />
                </div>
                {errors.email && <span className="checkout-field-error">{errors.email}</span>}
              </div>
            </div>

            <div className="checkout-field">
              <label className="checkout-field-label">Address Line 1</label>
              <div className="checkout-input-wrap">
                <Building2 size={15} />
                <input
                  className={`checkout-input with-icon ${errors.addressLine1 ? 'invalid' : ''}`}
                  type="text"
                  placeholder="House no., Street, Area"
                  value={form.addressLine1}
                  onChange={update('addressLine1')}
                />
              </div>
              {errors.addressLine1 && <span className="checkout-field-error">{errors.addressLine1}</span>}
            </div>

            <div className="checkout-field">
              <label className="checkout-field-label">Address Line 2 (optional)</label>
              <input
                className="checkout-input"
                type="text"
                placeholder="Landmark, Apartment, etc."
                value={form.addressLine2}
                onChange={update('addressLine2')}
              />
            </div>

            <div className="checkout-field-row three">
              <div className="checkout-field">
                <label className="checkout-field-label">City</label>
                <input
                  className={`checkout-input ${errors.city ? 'invalid' : ''}`}
                  type="text"
                  placeholder="City"
                  value={form.city}
                  onChange={update('city')}
                />
                {errors.city && <span className="checkout-field-error">{errors.city}</span>}
              </div>

              <div className="checkout-field">
                <label className="checkout-field-label">State</label>
                <select
                  className={`checkout-input ${errors.state ? 'invalid' : ''}`}
                  value={form.state}
                  onChange={update('state')}
                >
                  <option value="">Select</option>
                  {STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {errors.state && <span className="checkout-field-error">{errors.state}</span>}
              </div>

              <div className="checkout-field">
                <label className="checkout-field-label">Pincode</label>
                <input
                  className={`checkout-input ${errors.pincode ? 'invalid' : ''}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="110001"
                  value={form.pincode}
                  onChange={update('pincode')}
                />
                {errors.pincode && <span className="checkout-field-error">{errors.pincode}</span>}
              </div>
            </div>
          </div>

          <div className="checkout-form-footer">
            <div className="checkout-form-total">
              <span>Order Total</span>
              <strong>₹{total.toLocaleString('en-IN')}</strong>
            </div>
            <button type="submit" className="btn btn-primary checkout-form-submit">
              Continue to Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
