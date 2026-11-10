import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Briefcase, CheckCircle2, Eye, EyeOff, Lock, Mail, TrendingUp } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { extractErrorMessage } from '../utils/formatters';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both your email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err, 'Invalid email or password.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="jt-auth-page">
      <div className="container-fluid p-0 d-flex flex-column flex-lg-row min-vh-100">
        <div className="jt-auth-hero d-none d-lg-flex col-lg-5 p-5 flex-column justify-content-between">
          <div>
            <div className="d-flex align-items-center gap-3 mb-5">
              <span className="jt-brand-mark" style={{ width: '44px', height: '44px' }}>
                <Briefcase size={22} />
              </span>
              <span className="fs-4 fw-bold jt-heading">JobTrack</span>
            </div>

            <h2 className="display-6 fw-bold mb-3" style={{ lineHeight: 1.2 }}>
              Organize every application. Ace every interview.
            </h2>
            <p className="text-light opacity-75 fs-6 mb-5" style={{ maxWidth: '430px' }}>
              A dedicated command center to manage job applications, monitor stage conversions,
              and stay ahead of every recruiter touchpoint.
            </p>

            <div className="d-flex flex-column gap-3">
              {[
                'Real-time pipeline analytics & monthly activity charts',
                'Complete status transition history for every role',
                'Interview round scheduling with outcomes & notes',
              ].map((feature) => (
                <div key={feature} className="d-flex align-items-center gap-3">
                  <CheckCircle2 size={19} className="text-info flex-shrink-0" />
                  <span className="opacity-90" style={{ fontSize: '0.95rem' }}>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 text-light opacity-75 small">
            <TrendingUp size={16} />
            <span>Built with Java 21, Spring Boot & React</span>
          </div>
        </div>

        <div className="col-12 col-lg-7 d-flex align-items-center justify-content-center p-4 p-md-5">
          <div className="w-100" style={{ maxWidth: '430px' }}>
            <div className="d-flex align-items-center gap-2 mb-4 d-lg-none">
              <span className="jt-brand-mark">
                <Briefcase size={18} />
              </span>
              <span className="fs-4 fw-bold jt-heading">JobTrack</span>
            </div>

            <h1 className="h3 fw-bold mb-1">Welcome back</h1>
            <p className="text-muted mb-4">Sign in to access your job application workspace.</p>

            {error && (
              <div className="alert alert-danger py-2 px-3 small" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label htmlFor="loginEmail" className="form-label fw-semibold small">
                  Email Address
                </label>
                <div className="position-relative">
                  <Mail
                    size={17}
                    className="position-absolute top-50 translate-middle-y text-muted"
                    style={{ left: '14px' }}
                  />
                  <input
                    id="loginEmail"
                    type="email"
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <label htmlFor="loginPassword" className="form-label fw-semibold small">
                  Password
                </label>
                <div className="position-relative">
                  <Lock
                    size={17}
                    className="position-absolute top-50 translate-middle-y text-muted"
                    style={{ left: '14px' }}
                  />
                  <input
                    id="loginPassword"
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-sm position-absolute top-50 translate-middle-y border-0 text-muted"
                    style={{ right: '6px' }}
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-2 fw-semibold rounded-3"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <p className="text-center text-muted mt-4 mb-0 small">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="fw-semibold text-decoration-none">
                Create a free account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
