import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, CheckCircle2, Eye, EyeOff, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { extractErrorMessage } from '../utils/formatters';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (name.trim().length < 2) {
      setError('Full name must be at least 2 characters.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please provide a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err, 'Registration failed. Please try again.'));
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
              Turn your job hunt into a structured pipeline.
            </h2>
            <p className="text-light opacity-75 fs-6 mb-5" style={{ maxWidth: '430px' }}>
              Keep every job posting, recruiter contact, assessment deadline, and interview round
              in one secure place.
            </p>

            <div className="d-flex flex-column gap-3">
              {[
                'Private, JWT-secured workspace for your career records',
                'Instant search & filtering by status, job type, and work mode',
                'Visual dashboard highlighting response rate & interview schedule',
              ].map((item) => (
                <div key={item} className="d-flex align-items-center gap-3">
                  <CheckCircle2 size={19} className="text-info flex-shrink-0" />
                  <span className="opacity-90" style={{ fontSize: '0.95rem' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="text-light opacity-75 small">
            Free personal career tracker — Ready in seconds
          </div>
        </div>

        <div className="col-12 col-lg-7 d-flex align-items-center justify-content-center p-4 p-md-5">
          <div className="w-100" style={{ maxWidth: '440px' }}>
            <div className="d-flex align-items-center gap-2 mb-4 d-lg-none">
              <span className="jt-brand-mark">
                <Briefcase size={18} />
              </span>
              <span className="fs-4 fw-bold jt-heading">JobTrack</span>
            </div>

            <h1 className="h3 fw-bold mb-1">Create your account</h1>
            <p className="text-muted mb-4">Start tracking applications and interviews today.</p>

            {error && (
              <div className="alert alert-danger py-2 px-3 small" role="alert">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label htmlFor="regName" className="form-label fw-semibold small">
                  Full Name
                </label>
                <div className="position-relative">
                  <User
                    size={17}
                    className="position-absolute top-50 translate-middle-y text-muted"
                    style={{ left: '14px' }}
                  />
                  <input
                    id="regName"
                    type="text"
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Akash Verma"
                    autoComplete="name"
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="regEmail" className="form-label fw-semibold small">
                  Email Address
                </label>
                <div className="position-relative">
                  <Mail
                    size={17}
                    className="position-absolute top-50 translate-middle-y text-muted"
                    style={{ left: '14px' }}
                  />
                  <input
                    id="regEmail"
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

              <div className="mb-3">
                <label htmlFor="regPassword" className="form-label fw-semibold small">
                  Password
                </label>
                <div className="position-relative">
                  <Lock
                    size={17}
                    className="position-absolute top-50 translate-middle-y text-muted"
                    style={{ left: '14px' }}
                  />
                  <input
                    id="regPassword"
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.75rem' }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    autoComplete="new-password"
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

              <div className="mb-4">
                <label htmlFor="regConfirmPassword" className="form-label fw-semibold small">
                  Confirm Password
                </label>
                <div className="position-relative">
                  <Lock
                    size={17}
                    className="position-absolute top-50 translate-middle-y text-muted"
                    style={{ left: '14px' }}
                  />
                  <input
                    id="regConfirmPassword"
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    style={{ paddingLeft: '2.5rem' }}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    required
                  />
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
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <p className="text-center text-muted mt-4 mb-0 small">
              Already have an account?{' '}
              <Link to="/login" className="fw-semibold text-decoration-none">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
