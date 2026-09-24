import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import { formatDate } from '../../utils/formatters';

export default function RecentActivity({
  assignments = [],
  returnRequests = [],
  serviceRecords = [],
  assets = [],
  employees = [],
}) {
  const [activeTab, setActiveTab] = useState('assignments');

  // Helper map lookups for readable display
  const assetMap = new Map(assets.map((a) => [a.id, a]));
  const employeeMap = new Map(employees.map((e) => [e.id, e]));

  return (
    <div className="table-card" style={{ marginTop: '1.5rem' }}>
      <div className="table-toolbar" style={{ borderBottom: 'none', paddingBottom: '0.5rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Operational Activity</h3>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Real-time feed of asset allocations, employee return requests, and repair logs
          </p>
        </div>
      </div>

      <div style={{ padding: '0 1.25rem' }}>
        <div className="tabs-nav" style={{ margin: 0 }}>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
            onClick={() => setActiveTab('assignments')}
          >
            Recent Assignments ({assignments.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'returns' ? 'active' : ''}`}
            onClick={() => setActiveTab('returns')}
          >
            Pending Returns ({returnRequests.length})
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'services' ? 'active' : ''}`}
            onClick={() => setActiveTab('services')}
          >
            Maintenance Tickets ({serviceRecords.length})
          </button>
        </div>
      </div>

      <div className="table-responsive">
        {activeTab === 'assignments' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Assigned To</th>
                <th>Checkout Date</th>
                <th>Condition</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No recent assignments found.
                  </td>
                </tr>
              ) : (
                assignments.slice(0, 5).map((item) => {
                  const asset = assetMap.get(item.asset_id);
                  const employee = employeeMap.get(item.employee_id);
                  const isReturned = !!item.returned_at;

                  return (
                    <tr key={item.id}>
                      <td>
                        <span className="cell-code">{asset?.asset_tag || `Asset #${item.asset_id}`}</span>
                        <span className="cell-subtext">{asset?.name || '—'}</span>
                      </td>
                      <td>
                        <span className="cell-title">{employee?.name || `Employee #${item.employee_id}`}</span>
                        <span className="cell-subtext">{employee?.department || employee?.employee_code || '—'}</span>
                      </td>
                      <td>{formatDate(item.assigned_at)}</td>
                      <td>{item.condition_at_assignment || 'Good'}</td>
                      <td>
                        <StatusBadge status={isReturned ? 'Available' : 'Assigned'} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'returns' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Requested By</th>
                <th>Request Date</th>
                <th>Notes / Reason</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {returnRequests.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No return requests currently logged.
                  </td>
                </tr>
              ) : (
                returnRequests.slice(0, 5).map((item) => {
                  const asset = assetMap.get(item.asset_id);
                  const employee = employeeMap.get(item.employee_id);

                  return (
                    <tr key={item.id}>
                      <td>
                        <span className="cell-code">{asset?.asset_tag || `Asset #${item.asset_id}`}</span>
                        <span className="cell-subtext">{asset?.name || '—'}</span>
                      </td>
                      <td>
                        <span className="cell-title">{employee?.name || `Employee #${item.employee_id}`}</span>
                        <span className="cell-subtext">{employee?.department || '—'}</span>
                      </td>
                      <td>{formatDate(item.requested_at)}</td>
                      <td>{item.notes || '—'}</td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link to="/assignments" className="btn btn-secondary btn-sm">
                          Process
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}

        {activeTab === 'services' && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Service Type</th>
                <th>Vendor / Provider</th>
                <th>Service Date</th>
                <th>Cost</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {serviceRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No maintenance records logged.
                  </td>
                </tr>
              ) : (
                serviceRecords.slice(0, 5).map((item) => {
                  const asset = assetMap.get(item.asset_id);

                  return (
                    <tr key={item.id}>
                      <td>
                        <span className="cell-code">{asset?.asset_tag || `Asset #${item.asset_id}`}</span>
                        <span className="cell-subtext">{asset?.name || '—'}</span>
                      </td>
                      <td>
                        <span className="cell-title">{item.service_type}</span>
                        <span className="cell-subtext">{item.description}</span>
                      </td>
                      <td>{item.service_provider || 'Internal IT'}</td>
                      <td>{formatDate(item.service_date)}</td>
                      <td>{item.cost ? `$${Number(item.cost).toFixed(2)}` : '—'}</td>
                      <td>
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
