import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Employees from './pages/Employees';
import Assignments from './pages/Assignments';
import Services from './pages/Services';
import MyAssets from './pages/MyAssets';
import Login from './pages/Login';
import AuthLoading from './pages/AuthLoading';
import NotFound from './pages/NotFound';
import Toast from './components/common/Toast';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';

/**
 * Route protection wrapper.
 * Redirects unauthenticated visitors to /login.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

/**
 * Dynamically routes to the user's role landing page.
 * Admin -> /dashboard
 * Employee -> /my-assets
 */
function RootRedirect() {
  const { isAdmin } = useAuth();
  return <Navigate to={isAdmin ? '/dashboard' : '/my-assets'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Authentication Pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/auth-loading" element={<AuthLoading />} />

            {/* Authenticated Application Shell */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              {/* Dynamic entry route */}
              <Route index element={<RootRedirect />} />
              <Route path="dashboard" element={<Dashboard />} />

              {/* Hardware & Software Asset Catalog */}
              <Route path="assets" element={<Assets />} />
              <Route path="assets/:id" element={<Assets />} />

              {/* Employee Directory */}
              <Route path="employees" element={<Employees />} />
              <Route path="employees/:id" element={<Employees />} />

              {/* Assignments & Custody History */}
              <Route path="assignments" element={<Assignments />} />

              {/* Services & Maintenance */}
              <Route path="services" element={<Services />} />

              {/* Employee Self-Service Portal */}
              <Route path="my-assets" element={<MyAssets />} />

              {/* Catch-all 404 */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>

          {/* Global Toast Container */}
          <Toast />
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
