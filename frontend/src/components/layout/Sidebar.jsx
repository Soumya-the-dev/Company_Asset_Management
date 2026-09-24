import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getInitials } from '../../utils/formatters';

const adminNavItems = [
  {
    to: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9"></rect>
        <rect x="14" y="3" width="7" height="5"></rect>
        <rect x="14" y="12" width="7" height="9"></rect>
        <rect x="3" y="16" width="7" height="5"></rect>
      </svg>
    ),
  },
  {
    to: '/assets',
    label: 'Assets Inventory',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
      </svg>
    ),
  },
  {
    to: '/employees',
    label: 'Employees Directory',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
  },
  {
    to: '/assignments',
    label: 'Custody & Allocations',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 3 21 3 21 8"></polyline>
        <line x1="4" y1="20" x2="21" y2="3"></line>
        <polyline points="21 16 21 21 16 21"></polyline>
        <line x1="15" y1="15" x2="21" y2="21"></line>
        <line x1="4" y1="4" x2="9" y2="9"></line>
      </svg>
    ),
  },
  {
    to: '/services',
    label: 'Services & Maintenance',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
      </svg>
    ),
  },
  {
    to: '/my-assets',
    label: 'Employee View (Self-Service)',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    ),
  },
];

const employeeNavItems = [
  {
    to: '/my-assets',
    label: 'My Equipment & Custody',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
        <circle cx="12" cy="7" r="4"></circle>
      </svg>
    ),
  },
  {
    to: '/assets',
    label: 'Company Asset Catalog',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
        <line x1="8" y1="21" x2="16" y2="21"></line>
        <line x1="12" y1="17" x2="12" y2="21"></line>
      </svg>
    ),
  },
  {
    to: '/assignments',
    label: 'Allocations & History',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 3 21 3 21 8"></polyline>
        <line x1="4" y1="20" x2="21" y2="3"></line>
        <polyline points="21 16 21 21 16 21"></polyline>
        <line x1="15" y1="15" x2="21" y2="21"></line>
        <line x1="4" y1="4" x2="9" y2="9"></line>
      </svg>
    ),
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, isAdmin, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const navItems = isAdmin ? adminNavItems : employeeNavItems;

  function handleLogout() {
    logout();
    addToast('You have been securely signed out.', 'info');
    navigate('/login');
  }

  const displayName = user?.name || (isAdmin ? 'Alex Rivera' : 'Staff Employee');
  const roleLabel = isAdmin ? 'IT Administrator' : `${user?.employee_code || 'Staff'} • ${user?.department || 'Member'}`;

  return (
    <>
      <div
        className={`sidebar-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <NavLink
            to={isAdmin ? '/dashboard' : '/my-assets'}
            className="brand-logo"
            onClick={onClose}
          >
            <span className="brand-icon">A</span>
            <span>AssetManager</span>
          </NavLink>
        </div>

        <nav className="sidebar-nav" aria-label="Main Navigation">
          <div className="nav-section-title">
            {isAdmin ? 'Administration Modules' : 'Employee Self-Service'}
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div className="nav-section-title" style={{ marginTop: '1rem' }}>
            Portal Mode
          </div>

          <div style={{ padding: '0 0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span
              style={{
                display: 'inline-block',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                background: isAdmin ? 'rgba(37, 99, 235, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                color: isAdmin ? '#60a5fa' : '#34d399',
                fontWeight: 600,
                marginBottom: '0.4rem',
              }}
            >
              {isAdmin ? '🛡️ IT Operations Mode' : '👤 Employee Portal Mode'}
            </span>
            <p style={{ margin: 0, fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)' }}>
              {isAdmin
                ? 'Full inventory control, custody tracking, and maintenance approvals.'
                : 'View assigned hardware, submit return requests, and track check-ins.'}
            </p>
          </div>
        </nav>

        {/* Footer Profile & Logout */}
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-info-group">
              <div
                className="user-avatar"
                style={{
                  background: isAdmin ? '#2563eb' : '#059669',
                }}
                title={displayName}
              >
                {getInitials(displayName)}
              </div>
              <div className="user-details">
                <span className="user-name" title={displayName}>
                  {displayName}
                </span>
                <span className="user-role" title={roleLabel}>
                  {roleLabel}
                </span>
              </div>
            </div>

            <button
              type="button"
              className="logout-btn"
              onClick={handleLogout}
              title="Sign out of portal"
              aria-label="Sign out"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
