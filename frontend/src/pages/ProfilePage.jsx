import { useEffect, useState } from 'react';
import { Briefcase, CalendarCheck, CheckCircle2, ShieldCheck } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/userService';
import { extractErrorMessage, formatDateTime, getInitials } from '../utils/formatters';

const ProfilePage = () => {
  const { updateUserSession } = useAuth();

  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    let active = true;
    const loadProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await userService.getProfile();
        if (active) {
          setProfile(data);
          setName(data.name || '');
          setEmail(data.email || '');
        }
      } catch (err) {
        if (active) setError(extractErrorMessage(err, 'Failed to load profile.'));
      } finally {
        if (active) setLoading(false);
      }
    };
    loadProfile();
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (name.trim().length < 2) {
      setError('Full name must be at least 2 characters.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (newPassword || currentPassword || confirmNewPassword) {
      if (!currentPassword) {
        setError('Please enter your current password to update your password.');
        return;
      }
      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters.');
        return;
      }
      if (newPassword !== confirmNewPassword) {
        setError('New password and confirmation do not match.');
        return;
      }
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        ...(newPassword
          ? { currentPassword, newPassword }
          : {}),
      };

      const updated = await userService.updateProfile(payload);
      setProfile(updated);
      updateUserSession(updated);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to update profile.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading user profile..." />;
  }

  return (
    <div className="d-flex flex-column gap-4" style={{ maxWidth: '880px', margin: '0 auto' }}>
      {/* Summary Header */}
      <div className="jt-card p-4 d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4">
        <div className="d-flex align-items-center gap-3">
          <div className="jt-avatar" style={{ width: '62px', height: '62px', fontSize: '1.35rem', borderRadius: '16px' }}>
            {getInitials(profile?.name)}
          </div>
          <div>
            <h2 className="h4 fw-bold mb-1">{profile?.name}</h2>
            <p className="text-muted small mb-1">{profile?.email}</p>
            <span className="badge bg-light text-dark border d-inline-flex align-items-center gap-1">
              <ShieldCheck size={13} className="text-primary" />
              Joined {formatDateTime(profile?.createdAt)}
            </span>
          </div>
        </div>

        <div className="d-flex gap-3">
          <div className="p-3 rounded-3 bg-light border text-center" style={{ minWidth: '120px' }}>
            <div className="d-flex align-items-center justify-content-center gap-1 text-muted small mb-1">
              <Briefcase size={14} />
              Applications
            </div>
            <div className="h4 fw-bold tabular-nums mb-0">{profile?.totalApplications ?? 0}</div>
          </div>
          <div className="p-3 rounded-3 bg-light border text-center" style={{ minWidth: '120px' }}>
            <div className="d-flex align-items-center justify-content-center gap-1 text-muted small mb-1">
              <CalendarCheck size={14} />
              Interviews
            </div>
            <div className="h4 fw-bold tabular-nums mb-0">{profile?.totalInterviews ?? 0}</div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <div className="jt-card p-4">
        <h3 className="h5 fw-bold mb-1">Account Settings</h3>
        <p className="text-muted small mb-4">
          Update your display name, email address, or account password.
        </p>

        {error && (
          <div className="alert alert-danger py-2 small" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success py-2 small d-flex align-items-center gap-2" role="alert">
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label htmlFor="profileName" className="form-label small fw-semibold">
                Full Name
              </label>
              <input
                id="profileName"
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="profileEmail" className="form-label small fw-semibold">
                Email Address
              </label>
              <input
                id="profileEmail"
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <hr className="my-4" />

          <h4 className="h6 fw-bold mb-1">Change Password (Optional)</h4>
          <p className="text-muted small mb-3">
            Leave blank if you want to keep your current password.
          </p>

          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <label htmlFor="currentPassword" className="form-label small fw-semibold">
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                className="form-control"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                autoComplete="current-password"
              />
            </div>

            <div className="col-md-4">
              <label htmlFor="newPassword" className="form-label small fw-semibold">
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
                autoComplete="new-password"
              />
            </div>

            <div className="col-md-4">
              <label htmlFor="confirmNewPassword" className="form-label small fw-semibold">
                Confirm New Password
              </label>
              <input
                id="confirmNewPassword"
                type="password"
                className="form-control"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Repeat new password"
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="d-flex justify-content-end">
            <button type="submit" className="btn btn-primary px-4" disabled={saving}>
              {saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  Saving Changes...
                </>
              ) : (
                'Save Profile Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
