import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import { DEPARTMENTS } from '../utils/constants';
import Button from '../components/common/Button';

export default function Login() {
  const navigate = useNavigate();
  const { login, registerEmployee, isAuthenticated, isAdmin } = useAuth();
  const { addToast } = useToast();

  const [roleTab, setRoleTab] = useState('admin'); // 'admin' | 'employee'
  const [employeeMode, setEmployeeMode] = useState('login'); // 'login' | 'register'

  // Login form state
  const [identifier, setIdentifier] = useState('admin@company.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Registration form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDepartment, setRegDepartment] = useState('Engineering');
  const [regDesignation, setRegDesignation] = useState('Software Engineer');
  const [regCode, setRegCode] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(isAdmin ? '/dashboard' : '/my-assets', { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Auto-fill suggested employee code when entering register mode
  useEffect(() => {
    if (roleTab === 'employee' && employeeMode === 'register' && !regCode) {
      authService.getSuggestedEmployeeCode().then((code) => {
        setRegCode(code);
      });
    }
  }, [roleTab, employeeMode, regCode]);

  function handleRoleSwitch(role) {
    setRoleTab(role);
    setError(null);
    if (role === 'admin') {
      setIdentifier('admin@company.com');
      setPassword('admin123');
    } else {
      setIdentifier('EMP-1001');
      setPassword('password123');
      setEmployeeMode('login');
    }
  }

  async function handleLoginSubmit(e) {
    e?.preventDefault();
    setError(null);

    if (!identifier.trim()) {
      setError(
        roleTab === 'admin'
          ? 'Please enter your administrator email/ID.'
          : 'Please enter your Employee ID or Email.'
      );
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(identifier, password, roleTab);
      addToast(`Welcome back, ${user.name}!`, 'success');
      navigate('/auth-loading');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegisterSubmit(e) {
    e?.preventDefault();
    setError(null);

    if (!regName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!regEmail.trim()) {
      setError('Please enter your work email address.');
      return;
    }
    if (!regPassword || regPassword.length < 3) {
      setError('Password must be at least 3 characters.');
      return;
    }

    setLoading(true);
    try {
      const newUser = await registerEmployee({
        name: regName.trim(),
        email: regEmail.trim(),
        department: regDepartment,
        designation: regDesignation.trim() || 'Staff Member',
        employee_code: regCode.trim() || undefined,
        password: regPassword,
      });

      addToast(
        `Welcome to the company, ${newUser.name}! Your Employee ID is ${newUser.employee_code}.`,
        'success'
      );
      navigate('/auth-loading');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  }

  function handleQuickDemoLogin(demoId, demoPass, demoRole) {
    setRoleTab(demoRole);
    setIdentifier(demoId);
    setPassword(demoPass);
    setError(null);

    setLoading(true);
    login(demoId, demoPass, demoRole)
      .then((user) => {
        addToast(`Authenticated as ${user.name} (${user.role.toUpperCase()})`, 'success');
        navigate('/auth-loading');
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Brand / Logo */}
        <div className="login-brand">
          <div className="login-brand-logo">A</div>
          <h1 className="login-title">AssetManager Portal</h1>
          <p className="login-subtitle">Company Asset Management & Custody System</p>
        </div>

        {/* Primary Role Switcher Tabs */}
        <div className="role-tabs" role="tablist" aria-label="Login Role Selection">
          <button
            type="button"
            className={`role-tab-btn ${roleTab === 'admin' ? 'active' : ''}`}
            onClick={() => handleRoleSwitch('admin')}
            role="tab"
            aria-selected={roleTab === 'admin'}
          >
            🛡️ Administrator Access
          </button>
          <button
            type="button"
            className={`role-tab-btn ${roleTab === 'employee' ? 'active' : ''}`}
            onClick={() => handleRoleSwitch('employee')}
            role="tab"
            aria-selected={roleTab === 'employee'}
          >
            👤 Employee Portal
          </button>
        </div>

        {/* Employee Sub-Mode Toggle: Sign In vs Register Account */}
        {roleTab === 'employee' && (
          <div className="auth-sub-toggle">
            <button
              type="button"
              className={`auth-sub-btn ${employeeMode === 'login' ? 'active' : ''}`}
              onClick={() => {
                setEmployeeMode('login');
                setError(null);
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-sub-btn ${employeeMode === 'register' ? 'active' : ''}`}
              onClick={() => {
                setEmployeeMode('register');
                setError(null);
              }}
            >
              ➕ Create New Account
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="error-alert" style={{ marginBottom: '1.25rem' }}>
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* Form 1: Standard Sign-In Form (Admin or Employee)                         */}
        {/* ========================================================================= */}
        {(roleTab === 'admin' || employeeMode === 'login') && (
          <form onSubmit={handleLoginSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="login_identifier">
                {roleTab === 'admin' ? 'Admin Email / Username' : 'Employee ID or Work Email'}
              </label>
              <input
                id="login_identifier"
                type="text"
                className="form-input"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={
                  roleTab === 'admin'
                    ? 'admin@company.com'
                    : 'e.g. EMP-1001 or rahul.kumar@company.com'
                }
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.35rem',
                }}
              >
                <label className="form-label" htmlFor="login_password" style={{ margin: 0 }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                id="login_password"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              style={{ width: '100%', padding: '0.65rem' }}
            >
              {roleTab === 'admin' ? 'Sign In as Administrator' : 'Sign In to Employee Portal'}
            </Button>

            {roleTab === 'employee' && (
              <div className="auth-switch-prompt">
                <span>New employee joining the team?</span>
                <button
                  type="button"
                  className="auth-link-btn"
                  onClick={() => {
                    setEmployeeMode('register');
                    setError(null);
                  }}
                >
                  Create an account
                </button>
              </div>
            )}
          </form>
        )}

        {/* ========================================================================= */}
        {/* Form 2: New Employee Account Registration Form                            */}
        {/* ========================================================================= */}
        {roleTab === 'employee' && employeeMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="reg_name">
                Full Name <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="reg_name"
                type="text"
                className="form-input"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                placeholder="e.g. Kavita Sen"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg_email">
                Work Email <span style={{ color: 'var(--danger)' }}>*</span>
              </label>
              <input
                id="reg_email"
                type="email"
                className="form-input"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="e.g. kavita.sen@company.com"
                required
              />
            </div>

            <div className="form-row-2col">
              <div className="form-group">
                <label className="form-label" htmlFor="reg_dept">
                  Department
                </label>
                <select
                  id="reg_dept"
                  className="form-select"
                  value={regDepartment}
                  onChange={(e) => setRegDepartment(e.target.value)}
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg_desig">
                  Job Designation
                </label>
                <input
                  id="reg_desig"
                  type="text"
                  className="form-input"
                  value={regDesignation}
                  onChange={(e) => setRegDesignation(e.target.value)}
                  placeholder="e.g. Frontend Dev"
                />
              </div>
            </div>

            <div className="form-row-2col">
              <div className="form-group">
                <label className="form-label" htmlFor="reg_code">
                  Employee ID Code
                </label>
                <input
                  id="reg_code"
                  type="text"
                  className="form-input"
                  value={regCode}
                  onChange={(e) => setRegCode(e.target.value)}
                  placeholder="EMP-1006"
                />
              </div>

              <div className="form-group">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.35rem',
                  }}
                >
                  <label className="form-label" htmlFor="reg_password" style={{ margin: 0 }}>
                    Password <span style={{ color: 'var(--danger)' }}>*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {showRegPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  id="reg_password"
                  type={showRegPassword ? 'text' : 'password'}
                  className="form-input"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Set password..."
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              style={{ width: '100%', padding: '0.65rem', marginTop: '0.5rem' }}
            >
              Register Account & Enter Portal
            </Button>

            <div className="auth-switch-prompt">
              <span>Already have an employee account?</span>
              <button
                type="button"
                className="auth-link-btn"
                onClick={() => {
                  setEmployeeMode('login');
                  setError(null);
                }}
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* Quick Demo Credentials Box for Easy Evaluation */}
        {(roleTab === 'admin' || employeeMode === 'login') && (
          <div className="demo-creds-container">
            <div className="demo-creds-title">
              <span>⚡ Instant Demo Access</span>
              <span style={{ fontWeight: 400, textTransform: 'none', fontSize: '0.7rem' }}>
                One-click sign in
              </span>
            </div>
            <div className="demo-buttons-grid">
              <button
                type="button"
                className="demo-btn"
                onClick={() => handleQuickDemoLogin('admin@company.com', 'admin123', 'admin')}
                disabled={loading}
              >
                <div>
                  <span className="demo-btn-role">🛡️ Admin (IT Operations)</span>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Full system CRUD, state machine & servicing
                  </span>
                </div>
                <span className="demo-btn-code">admin@company.com</span>
              </button>

              <button
                type="button"
                className="demo-btn"
                onClick={() => handleQuickDemoLogin('EMP-1001', 'password123', 'employee')}
                disabled={loading}
              >
                <div>
                  <span className="demo-btn-role">👤 Employee (Rahul Kumar)</span>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Self-service custody, return requests & profile
                  </span>
                </div>
                <span className="demo-btn-code">EMP-1001</span>
              </button>

              <button
                type="button"
                className="demo-btn"
                onClick={() => handleQuickDemoLogin('EMP-1002', 'password123', 'employee')}
                disabled={loading}
              >
                <div>
                  <span className="demo-btn-role">👤 Employee (Priya Sharma)</span>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    QA Engineer hardware allocations
                  </span>
                </div>
                <span className="demo-btn-code">EMP-1002</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
