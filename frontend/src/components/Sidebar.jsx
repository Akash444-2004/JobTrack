import { NavLink } from 'react-router-dom';
import {
  Briefcase,
  CalendarClock,
  LayoutDashboard,
  LogOut,
  PlusCircle,
  UserCircle,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getInitials } from '../utils/formatters';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/applications', label: 'Applications', icon: Briefcase },
    { to: '/applications/new', label: 'Add Application', icon: PlusCircle },
    { to: '/interviews', label: 'Interviews', icon: CalendarClock },
    { to: '/profile', label: 'User Profile', icon: UserCircle },
  ];

  return (
    <>
      {isOpen && <div className="jt-sidebar-overlay" onClick={onClose} aria-hidden="true" />}

      <aside className={`jt-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="jt-sidebar-brand">
          <NavLink to="/dashboard" className="jt-brand-logo" onClick={onClose}>
            <span className="jt-brand-mark">
              <Briefcase size={19} />
            </span>
            <span>JobTrack</span>
          </NavLink>
          <button
            type="button"
            className="btn btn-sm text-light d-lg-none border-0"
            onClick={onClose}
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="jt-sidebar-nav" aria-label="Main navigation">
          <div className="jt-nav-section-label">Workspace</div>
          {navItems.map((item) => {
            const NavIcon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/applications'}
                onClick={onClose}
                className={({ isActive }) => `jt-nav-link ${isActive ? 'active' : ''}`}
              >
                <NavIcon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="jt-sidebar-footer">
          <div className="d-flex align-items-center gap-2 px-2 py-2 mb-2 rounded-3" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div className="jt-avatar" style={{ width: '34px', height: '34px', fontSize: '0.78rem' }}>
              {getInitials(user?.name)}
            </div>
            <div className="overflow-hidden flex-grow-1">
              <div className="text-white fw-semibold text-truncate" style={{ fontSize: '0.85rem' }}>
                {user?.name || 'User'}
              </div>
              <div className="text-secondary text-truncate" style={{ fontSize: '0.74rem' }}>
                {user?.email || ''}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="btn w-100 d-flex align-items-center justify-content-center gap-2 text-light"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.14)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              fontSize: '0.86rem',
              fontWeight: 500,
              borderRadius: '10px',
              padding: '0.55rem 0.75rem',
            }}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
