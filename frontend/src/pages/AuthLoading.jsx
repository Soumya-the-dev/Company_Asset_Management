import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/formatters';

const STEPS = [
  { progress: 20, message: 'Verifying session token & cryptographic signature...' },
  { progress: 48, message: 'Validating role permissions & access policies...' },
  { progress: 75, message: 'Syncing hardware inventory & assigned custody profiles...' },
  { progress: 95, message: 'Initializing enterprise dashboard workspace...' },
  { progress: 100, message: 'Workspace ready. Redirecting to console...' },
];

export default function AuthLoading() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    // If somehow not logged in, redirect to login
    if (!isAuthenticated || !user) {
      const timer = setTimeout(() => navigate('/login', { replace: true }), 400);
      return () => clearTimeout(timer);
    }

    // Step-by-step progress timer
    const interval = setInterval(() => {
      setStepIndex((prev) => {
        if (prev < STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 380);

    // Final redirection after progress completion
    const redirectTimer = setTimeout(() => {
      if (isAdmin) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/my-assets', { replace: true });
      }
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(redirectTimer);
    };
  }, [isAuthenticated, user, isAdmin, navigate]);

  const currentStep = STEPS[stepIndex] || STEPS[0];
  const userName = user?.name || 'Authorized User';
  const userRole = user?.role === 'admin' ? 'Administrator' : 'Staff Employee';
  const userDept = user?.department || 'Company Operations';

  return (
    <div className="auth-loading-screen">
      <div className="auth-loading-card">
        {/* User Identity Avatar */}
        <div className="auth-loading-avatar" aria-hidden="true">
          {getInitials(userName)}
        </div>

        <h2 className="auth-loading-user-name">Welcome back, {userName}!</h2>
        <div className="auth-loading-user-sub">
          <span style={{ fontWeight: 600, color: user?.role === 'admin' ? 'var(--primary)' : 'var(--success)' }}>
            {userRole}
          </span>{' '}
          • {userDept}
        </div>

        {/* Progress bar */}
        <div className="auth-progress-track" role="progressbar" aria-valuenow={currentStep.progress} aria-valuemin="0" aria-valuemax="100">
          <div
            className="auth-progress-fill"
            style={{ width: `${currentStep.progress}%` }}
          />
        </div>

        {/* Dynamic status message */}
        <div className="auth-step-status">
          {currentStep.progress < 100 && <span className="auth-loading-spinner" aria-hidden="true" />}
          <span>{currentStep.message}</span>
        </div>
      </div>
    </div>
  );
}
