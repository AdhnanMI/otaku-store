import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, Gift, Zap, Flame, Check, User as UserIcon } from 'lucide-react';
import Layout from '../components/Layout';
import { apiFetch } from '../api/api';
import { useNavigate } from 'react-router-dom';
import './SignAndLoginPage.css';


function GoogleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} {...props}>
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29A11.96 11.96 0 000 12c0 1.93.46 3.76 1.29 5.38l3.98-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
    </svg>
  );
}

const LOGIN_PERKS = [
  { icon: ShieldCheck, label: 'Secure & Safe Login' },
  { icon: Gift, label: 'Exclusive Member Offers' },
  { icon: Zap, label: 'Faster Checkout' },
];

const SIGNUP_PERKS = [
  { icon: Gift, label: 'Exclusive Member Discounts' },
  { icon: Zap, label: 'Faster Order & Checkout' },
  { icon: ShieldCheck, label: 'Save Wishlist & More' },
];

function PasswordInput({ placeholder, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div className="auth-input-wrap">
      <Lock size={16} />
      <input
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        className="auth-input with-icon pw"
        value={value}
        onChange={onChange}
      />
      <button type="button" onClick={() => setShow((s) => !s)} className="auth-toggle-visibility" aria-label="Toggle password visibility">
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function ArtPanel({ mode }) {
  return (
    <div className="auth-art-panel">
      <div className="auth-art-glow" />
      <div className="auth-art-badge">
        <Flame size={48} />
      </div>
      <div className="auth-art-content">
        <p className="auth-art-eyebrow">{mode === 'login' ? 'Welcome Back' : 'Join the Crew'}</p>
        <h2 className="auth-art-title">
          {mode === 'login' ? (
            <>
              Login to your <br /> Otaku Store account
            </>
          ) : (
            <>
              Create your <br /> Otaku Store account
            </>
          )}
        </h2>
        <p className="auth-art-copy">
          {mode === 'login' ? 'Access your orders, wishlist and exclusive offers.' : 'Sign up and get access to exclusive deals, fast checkout and more!'}
        </p>
        <ul className="auth-art-perks">
          {(mode === 'login' ? LOGIN_PERKS : SIGNUP_PERKS).map(({ icon: Icon, label }) => (
            <li key={label} className="auth-art-perk">
              <Icon size={14} /> {label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function SignAndLoginPage() {
  const { setUser } = useStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('login');
  const isLogin = mode === 'login';
  const navigate = useNavigate();
  const [authError, setAuthError] = useState('');
  const [forgotPassword, setForgotPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [forgotStep, setForgotStep] = useState('email');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <Layout showSearch={false}>
      <div className="auth-page">
        <div className="auth-toggle-wrap">
          <div className="auth-toggle">
            <button
              onClick={() => {
                setAuthError('');
                setForgotPassword(false);
                setMode('login');
              }}
              className={`auth-toggle-btn ${isLogin ? 'active' : ''}`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setAuthError('');
                setForgotPassword(false);
                setMode('signup');
              }}
              className={`auth-toggle-btn ${!isLogin ? 'active' : ''}`}
            >
              Sign Up
            </button>
          </div>
        </div>

        <div className="auth-card">
          <ArtPanel mode={mode} />

          <div className="auth-form-panel">
            {forgotPassword ? (
              <>
                {forgotStep === 'email' ? (
                  <>
                    <h1 className="auth-form-title">Forgot Password?</h1>

                    <p className="auth-form-subtitle">
                      Enter your email address and we'll send you a verification code.
                    </p>

                    <form
                      className="auth-form"
                      onSubmit={async (e) => {
                        e.preventDefault();

                        setAuthError('');
                        setForgotLoading(true);

                        try {
                          const data = await apiFetch('/auth/forgot-password/request', {
                            method: 'POST',
                            body: JSON.stringify({ email }),
                          });

                          console.log('OTP REQUEST SUCCESS:', data);
                          setForgotStep('otp');
                        } catch (error) {
                          console.error(error);
                          setAuthError(error.message);
                        } finally {
                          setForgotLoading(false);
                        }
                      }}
                    >
                      <div>
                        <label className="auth-field-label">Email Address</label>

                        <div className="auth-input-wrap">
                          <Mail size={16} />

                          <input
                            type="email"
                            placeholder="Enter your email"
                            className="auth-input with-icon"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      {authError && (
                        <p className="auth-error">
                          {authError}
                        </p>
                      )}

                      <button
                        type="submit"
                        className="btn btn-primary auth-submit-btn"
                        disabled={forgotLoading}
                      >
                        {forgotLoading ? 'Sending OTP...' : 'Send OTP'}
                      </button>
                    </form>

                    <p className="auth-switch-row">
                      Remember your password?{' '}
                      <button
                        type="button"
                        className="auth-switch-btn"
                        onClick={() => {
                          setAuthError('');
                          setForgotPassword(false);
                          setForgotStep('email');
                          setOtp('');
                        }}
                      >
                        Back to Login
                      </button>
                    </p>
                  </>
                ) : forgotStep === 'otp' ? (
                  <>
                    <h1 className="auth-form-title">Enter OTP</h1>

                    <p className="auth-form-subtitle">
                      Enter the 6-digit verification code sent to your email.
                    </p>

                    <form
                      className="auth-form"
                      onSubmit={async (e) => {
                        e.preventDefault();

                        setAuthError('');
                        setForgotLoading(true);

                        try {
                          const data = await apiFetch('/auth/forgot-password/verify', {
                            method: 'POST',
                            body: JSON.stringify({
                              email,
                              otp,
                            }),
                          });

                          console.log('OTP VERIFY SUCCESS:', data);

                          setResetToken(data.resetToken);
                          setForgotStep('password');
                          // Temporary for testing.
                          console.log('RESET TOKEN:', data.resetToken);
                        } catch (error) {
                          console.error('OTP VERIFY FAILED:', error);
                          setAuthError(error.message);
                        } finally {
                          setForgotLoading(false);
                        }
                      }}
                    >
                      <div>
                        <label className="auth-field-label">Verification Code</label>

                        <input
                          type="text"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="Enter 6-digit OTP"
                          className="auth-input"
                          value={otp}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '');
                            setOtp(value);
                          }}
                          required
                        />
                      </div>

                      {authError && (
                        <p className="auth-error">
                          {authError}
                        </p>
                      )}

                      <button
                        type="submit"
                        className="btn btn-primary auth-submit-btn"
                        disabled={forgotLoading || otp.length !== 6}
                      >
                        {forgotLoading ? 'Verifying...' : 'Verify OTP'}
                      </button>
                    </form>

                    <p className="auth-switch-row">
                      Didn&apos;t receive the code?{' '}
                      <button
                        type="button"
                        className="auth-switch-btn"
                        onClick={() => {
                          setAuthError('');
                          setForgotStep('email');
                          setOtp('');
                        }}
                      >
                        Try Again
                      </button>
                    </p>
                  </>
                ) : (
                  <>
                    <h1 className="auth-form-title">Create New Password</h1>

                    <p className="auth-form-subtitle">
                      Enter a new password for your Otaku Store account.
                    </p>

                    <form
                      className="auth-form"
                      onSubmit={async (e) => {
                        e.preventDefault();

                        setAuthError('');

                        if (newPassword.length < 6) {
                          setAuthError('Password must be at least 6 characters.');
                          return;
                        }

                        if (newPassword !== confirmPassword) {
                          setAuthError('Passwords do not match.');
                          return;
                        }

                        setForgotLoading(true);

                        try {
                          const data = await apiFetch('/auth/forgot-password/reset', {
                            method: 'POST',
                            body: JSON.stringify({
                              resetToken,
                              newPassword,
                            }),
                          });

                          console.log('PASSWORD RESET SUCCESS:', data);

                          setForgotPassword(false);
                          setForgotStep('email');
                          setOtp('');
                          setResetToken('');
                          setNewPassword('');
                          setConfirmPassword('');
                          setAuthError('');
                          setMode('login');
                        } catch (error) {
                          console.error('PASSWORD RESET FAILED:', error);
                          setAuthError(error.message);
                        } finally {
                          setForgotLoading(false);
                        }
                      }}
                    >
                      <div>
                        <label className="auth-field-label">New Password</label>

                        <PasswordInput
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="auth-field-label">Confirm Password</label>

                        <PasswordInput
                          placeholder="Confirm new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>

                      {authError && (
                        <p className="auth-error">
                          {authError}
                        </p>
                      )}

                      <button
                        type="submit"
                        className="btn btn-primary auth-submit-btn"
                        disabled={forgotLoading}
                      >
                        {forgotLoading ? 'Resetting Password...' : 'Reset Password'}
                      </button>
                    </form>

                    <p className="auth-switch-row">
                      Want to start over?{' '}
                      <button
                        type="button"
                        className="auth-switch-btn"
                        onClick={() => {
                          setAuthError('');
                          setForgotStep('email');
                          setOtp('');
                          setResetToken('');
                          setNewPassword('');
                          setConfirmPassword('');
                        }}
                      >
                        Start Again
                      </button>
                    </p>
                  </>
                )}
              </>
            ) : isLogin ? (
              <>
                <h1 className="auth-form-title">Login</h1>
                <p className="auth-form-subtitle">Welcome back! Please login to continue.</p>
                <form
                  className="auth-form"
                  onSubmit={async (e) => {
                    e.preventDefault();

                    setAuthError('');
                    setAuthLoading(true);

                    try {
                      const data = await apiFetch('/auth/login', {
                        method: 'POST',
                        body: JSON.stringify({
                          email,
                          password,
                        }),
                      });

                      localStorage.setItem('token', data.token);
                      setUser(data.user);
                      navigate('/');
                    } catch (error) {
                      console.error(error);
                      setAuthError(error.message);
                    } finally {
                      setAuthLoading(false);
                    }
                  }}
                >
                  <div>
                    <label className="auth-field-label">Email Address</label>
                    <div className="auth-input-wrap">
                      <Mail size={16} />
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="auth-input with-icon"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="auth-field-label">Password</label>
                    <PasswordInput
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    {authError && (
                      <p className="auth-error">
                        {authError}
                      </p>
                    )}
                    <div className="auth-forgot-row">
                      <button
                        type="button"
                        className="auth-forgot-btn"
                        onClick={() => {
                          setAuthError('');
                          setForgotPassword(true);
                        }}
                      >
                        Forgot Password?
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary auth-submit-btn"
                    disabled={authLoading}
                  >
                    {authLoading ? 'Logging in...' : 'Login'}
                  </button>
                </form>

                <div className="auth-divider">
                  <span className="auth-divider-line" /> or continue with <span className="auth-divider-line" />
                </div>
                <div className="auth-social-row">
                  <button className="auth-social-btn">
                    <GoogleIcon /> Google
                  </button>
                  <button className="auth-social-btn">
                    <UserIcon size={16} /> Apple
                  </button>
                </div>
                <p className="auth-switch-row">
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => {
                      setAuthError('');
                      setForgotPassword(false);
                      setMode('signup');
                    }}
                    className="auth-switch-btn"
                  >
                    Sign up
                  </button>
                </p>
              </>
            ) : (
              <>
                <h1 className="auth-form-title">Sign Up</h1>
                <p className="auth-form-subtitle">Create your account in less than a minute.</p>

                <form
                  className="auth-form"
                  onSubmit={async (e) => {
                    e.preventDefault();

                    setAuthError('');
                    setAuthLoading(true);

                    try {
                      const data = await apiFetch('/auth/register', {
                        method: 'POST',
                        body: JSON.stringify({
                          name: `${firstName} ${lastName}`.trim(),
                          email,
                          password,
                        }),
                      });
                      localStorage.setItem('token', data.token);
                      setUser(data.user);

                      await new Promise((resolve) => setTimeout(resolve, 500));

                      navigate('/');
                    } catch (error) {
                      console.error(error);
                      setAuthError(error.message);
                    } finally {
                      setAuthLoading(false);
                    }
                  }}
                >
                  <div className="auth-name-row">
                    <div>
                      <label className="auth-field-label">First Name</label>
                      <input
                        type="text"
                        placeholder="Enter first name"
                        className="auth-input"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="auth-field-label">Last Name</label>
                      <input
                        type="text"
                        placeholder="Enter last name"
                        className="auth-input"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="auth-field-label">Email Address</label>
                    <div className="auth-input-wrap">
                      <Mail size={16} />
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="auth-input with-icon"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="auth-field-label">Password</label>
                    <PasswordInput
                      placeholder="Create a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    {authError && (
                      <p className="auth-error">
                        {authError}
                      </p>
                    )}
                    <div className="auth-password-rules">
                      {['At least 8 characters', 'One uppercase letter', 'One number or special character'].map((r) => (
                        <div key={r} className="auth-password-rule">
                          <Check size={12} /> {r}
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary auth-submit-btn"
                    disabled={authLoading}
                  >
                    {authLoading ? 'Creating account...' : 'Sign Up'}
                  </button>
                </form>

                <div className="auth-divider">
                  <span className="auth-divider-line" /> or sign up with <span className="auth-divider-line" />
                </div>
                <div className="auth-social-row">
                  <button className="auth-social-btn">
                    <GoogleIcon /> Google
                  </button>
                  <button className="auth-social-btn">
                    <UserIcon size={16} /> Apple
                  </button>
                </div>
                <p className="auth-switch-row">
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setAuthError('');
                      setForgotPassword(false);
                      setMode('login');
                    }}
                    className="auth-switch-btn"
                  >
                    Login
                  </button>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}