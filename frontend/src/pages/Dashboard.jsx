import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/dashboard/StatCard';
import RecentActivity from '../components/dashboard/RecentActivity';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import Button from '../components/common/Button';
import StatusBadge from '../components/common/StatusBadge';
import { assetService } from '../services/assetService';
import { assignmentService } from '../services/assignmentService';
import { employeeService } from '../services/employeeService';
import { serviceRecordService } from '../services/serviceRecordService';

export default function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [serviceRecords, setServiceRecords] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadDashboardData() {
    setLoading(true);
    setError(null);
    try {
      const [
        statsData,
        assignmentsData,
        returnsData,
        servicesData,
        assetsData,
        employeesData,
      ] = await Promise.all([
        assetService.getDashboardStats(),
        assignmentService.getAssignments({ limit: 10 }),
        assignmentService.getReturnRequests(),
        serviceRecordService.getServiceRecords({ limit: 10 }),
        assetService.getAssets({ limit: 100 }),
        employeeService.getEmployees({ limit: 100 }),
      ]);

      setStats(statsData);
      setAssignments(assignmentsData || []);
      setReturnRequests(returnsData || []);
      setServiceRecords(servicesData || []);
      setAssets(assetsData || []);
      setEmployees(employeesData || []);
    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return <Loading text="Loading dashboard metrics and operational feed..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadDashboardData} />;
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <h1>Enterprise Dashboard</h1>
          <p>Real-time asset allocations, hardware health, and employee custody</p>
        </div>
        <div className="page-actions">
          <Button variant="secondary" size="sm" onClick={loadDashboardData}>
            ↻ Refresh Data
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/assets')}>
            + Manage Assets
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Assets"
          value={stats?.total_assets ?? assets.length}
          subtitle="Registered company inventory"
          icon="📦"
          color="#2563eb"
          bg="#eff6ff"
          onClick={() => navigate('/assets')}
        />
        <StatCard
          title="Available"
          value={stats?.available_assets ?? 0}
          subtitle="In stock & ready to assign"
          icon="🟢"
          color="#059669"
          bg="#ecfdf5"
          onClick={() => navigate('/assets?status=Available')}
        />
        <StatCard
          title="Assigned"
          value={stats?.assigned_assets ?? 0}
          subtitle="Currently with employees"
          icon="👤"
          color="#1d4ed8"
          bg="#eff6ff"
          onClick={() => navigate('/assets?status=Assigned')}
        />
        <StatCard
          title="In Repair"
          value={stats?.in_repair_assets ?? 0}
          subtitle="Undergoing maintenance"
          icon="🛠️"
          color="#d97706"
          bg="#fffbeb"
          onClick={() => navigate('/services')}
        />
        <StatCard
          title="Return Requested"
          value={stats?.return_requested_assets ?? 0}
          subtitle="Awaiting return verification"
          icon="🔄"
          color="#7c3aed"
          bg="#faf5ff"
          onClick={() => navigate('/assignments')}
        />
        <StatCard
          title="Retired"
          value={stats?.retired_assets ?? 0}
          subtitle="Decommissioned equipment"
          icon="📁"
          color="#64748b"
          bg="#f1f5f9"
          onClick={() => navigate('/assets?status=Retired')}
        />
      </div>

      {/* State Machine Flow Architecture Card */}
      <div
        className="table-card"
        style={{
          marginTop: '1.25rem',
          padding: '1.25rem',
          background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-subtle) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>Deterministic Asset Lifecycle State Machine</h3>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Strict transition rules enforced across allocations, employee return requests, and servicing
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--primary)', background: 'var(--primary-subtle)', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
            Track 02 Specification
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginTop: '0.5rem' }}>
          <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
            <div style={{ marginBottom: '0.35rem' }}><StatusBadge status="Available" /></div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              <strong>In Stock:</strong> Can be allocated to employees (→ <em>Assigned</em>), sent to maintenance (→ <em>In Repair</em>), or decommissioned (→ <em>Retired</em>).
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
            <div style={{ marginBottom: '0.35rem' }}><StatusBadge status="Assigned" /></div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              <strong>Active Custody:</strong> Custodian holds asset. Valid transitions: Return request filed (→ <em>Return Requested</em>) or direct check-in (→ <em>Available</em>).
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
            <div style={{ marginBottom: '0.35rem' }}><StatusBadge status="Return Requested" /></div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              <strong>Pending Review:</strong> Employee requested check-in. IT Approves (→ <em>Available</em>) or Rejects (reverts to <em>Assigned</em>).
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
            <div style={{ marginBottom: '0.35rem' }}><StatusBadge status="In Repair" /></div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              <strong>Servicing:</strong> Locked from allocation during vendor repairs. Ticket resolution restores asset to <em>Available</em>.
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
            <div style={{ marginBottom: '0.35rem' }}><StatusBadge status="Retired" /></div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
              <strong>Terminal State:</strong> Equipment end-of-life or recycled. Decommissioned from active inventory and assignment workflows.
            </div>
          </div>
        </div>
      </div>

      {/* Operational Activity Tables */}
      <RecentActivity
        assignments={assignments}
        returnRequests={returnRequests}
        serviceRecords={serviceRecords}
        assets={assets}
        employees={employees}
      />
    </div>
  );
}
