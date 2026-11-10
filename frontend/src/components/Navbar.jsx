import { Link, useLocation } from 'react-router-dom';
import { Menu, Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getInitials } from '../utils/formatters';

const PAGE_TITLES = [
  { prefix: '/dashboard', title: 'Dashboard', subtitle: 'Overview of your job search pipeline' },
  { prefix: '/applications/new', title: 'Add Application', subtitle: 'Log a new opportunity to your tracker' },
  { prefix: '/applications/', suffix: '/edit', title: 'Edit Application', subtitle: 'Update role details and current stage' },
  { prefix: '/applications/', title: 'Application Details', subtitle: 'Full role record, status timeline & interviews' },
  { prefix: '/applications', title: 'Applications', subtitle: 'Search, filter and manage every application' },
  { prefix: '/interviews', title: 'Interviews', subtitle: 'Track upcoming rounds and interview outcomes' },
  { prefix: '/profile', title: 'User Profile', subtitle: 'Manage your account details and password' },
];

const Navbar = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();

  const matched =
    PAGE_TITLES.find((item) => {
      if (item.suffix) {
        return location.pathname.startsWith(item.prefix) && location.pathname.endsWith(item.suffix);
      }
      return location.pathname.startsWith(item.prefix);
    }) || { title: 'JobTrack', subtitle: 'Job Application Tracking System' };

  return (
    <header className="jt-navbar">
      <div className="d-flex align-items-center gap-3 min-w-0">
        <button
          type="button"
          className="btn btn-light border d-lg-none p-2"
          onClick={onToggleSidebar}
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <h1 className="h5 mb-0 fw-bold text-truncate">{matched.title}</h1>
          <p className="text-muted mb-0 d-none d-sm-block text-truncate" style={{ fontSize: '0.8rem' }}>
            {matched.subtitle}
          </p>
        </div>
      </div>

      <div className="d-flex align-items-center gap-2 gap-md-3">
        <Link
          to="/applications/new"
          className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1 px-3 py-2 rounded-3"
        >
          <Plus size={16} />
          <span className="d-none d-sm-inline">New Application</span>
        </Link>

        <Link
          to="/profile"
          className="d-flex align-items-center gap-2 text-decoration-none text-dark px-2 py-1 rounded-3 border bg-white"
        >
          <div className="jt-avatar" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
            {getInitials(user?.name)}
          </div>
          <span className="fw-medium d-none d-md-inline" style={{ fontSize: '0.86rem' }}>
            {user?.name?.split(' ')[0] || 'Account'}
          </span>
        </Link>
      </div>
    </header>
  );
};

export default Navbar;
