import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getInitials } from '../../utils/formatters';

const routeTitles = {
  '/dashboard': { title: 'Enterprise Dashboard', subtitle: 'Overview of asset custody, maintenance, and allocation' },
  '/assets': { title: 'Asset Inventory', subtitle: 'Catalog, hardware tags, specifications, and lifecycle' },
  '/employees': { title: 'Employee Directory', subtitle: 'Staff profiles and custodian asset records' },
  '/assignments': { title: 'Asset Allocations & Custody', subtitle: 'Checkouts, check-ins, and return requests' },
  '/services': { title: 'Maintenance & Service Records', subtitle: 'Repair tickets, vendor tracking, and inspections' },
  '/my-assets': { title: 'My Equipment & Custody', subtitle: 'Self-service equipment overview, return requests, and past check-ins' },
};

export default function Header({ onMenuToggle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const { addToast } = useToast();

  const current = routeTitles[location.pathname] || {
    title: 'Asset Management System',
    subtitle: 'Internal IT Operations Console',
  };

  const isMock = import.meta.env.VITE_USE_MOCK === 'true';

  function handleLogout() {
    logout();
    addToast('You have been securely signed out.', 'info');
    navigate('/login');
  }

  const displayName = user?.name || (isAdmin ? 'Admin' : 'Employee');

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <div className="header-title-container">
          <h2 className="header-title">{current.title}</h2>
          <p className="header-subtitle">{current.subtitle}</p>
        </div>
      </div>

      <div className="header-right">
        {/* API connection indicator */}
        <div className="system-status-indicator" title={`Connected to: ${API_BASE_URL}`}>
          <span
            className="status-dot"
            style={{ backgroundColor: isMock ? '#f59e0b' : '#10b981' }}
          />
          <span>{isMock ? 'Mock API Active' : 'API Online'}</span>
        </div>

        {/* User Status Pill & Quick Logout */}
        {user && (
          <div className="header-user-badge">
            <div
              className="header-avatar"
              style={{ background: isAdmin ? 'var(--primary)' : '#059669' }}
            >
              {getInitials(displayName)}
            </div>
            <div className="header-user-info">
              <span className="header-user-name">{displayName}</span>
              <span className={`header-role-tag ${isAdmin ? 'admin' : 'employee'}`}>
                {isAdmin ? 'Admin' : (user.employee_code || 'Employee')}
              </span>
            </div>
            <button
              type="button"
              className="header-signout-btn"
              onClick={handleLogout}
              title="Sign out of portal"
            >
              Exit
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
