import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import StatusBadge from '../common/StatusBadge';
import { formatDate } from '../../utils/formatters';

export default function EmployeeDetails({
  employee,
  isOpen,
  onClose,
  assignedAssets = [],
  assignmentHistory = [],
  returnRequests = [],
  onReturnAssetClick,
}) {
  const [activeTab, setActiveTab] = useState('current');

  if (!employee) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Employee Profile: ${employee.name}`}
      size="lg"
      footer={
        <Button variant="secondary" size="sm" onClick={onClose}>
          Close
        </Button>
      }
    >
      {/* Header Profile Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'var(--primary)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.15rem',
            fontWeight: 'bold',
          }}
        >
          {employee.name.charAt(0)}
        </div>
        <div>
          <h3 style={{ margin: '0 0 0.2rem 0', fontSize: '1.15rem', fontWeight: 600 }}>
            {employee.name}
          </h3>
          <span className="cell-subtext">
            {employee.employee_code} • {employee.department || 'General'} • {employee.designation || 'Staff'}
          </span>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="detail-grid" style={{ marginBottom: '1.25rem' }}>
        <div className="detail-item">
          <span className="detail-label">Email</span>
          <span className="detail-value">{employee.email}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Phone</span>
          <span className="detail-value">{employee.phone || '—'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Department</span>
          <span className="detail-value">{employee.department || '—'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Designation</span>
          <span className="detail-value">{employee.designation || '—'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Registered On</span>
          <span className="detail-value">{formatDate(employee.created_at)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Active Hardware</span>
          <span className="detail-value" style={{ fontWeight: 700, color: 'var(--primary)' }}>
            {assignedAssets.length} {assignedAssets.length === 1 ? 'asset' : 'assets'}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs-nav">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'current' ? 'active' : ''}`}
          onClick={() => setActiveTab('current')}
        >
          Currently Assigned Assets ({assignedAssets.length})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Custody History ({assignmentHistory.length})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'returns' ? 'active' : ''}`}
          onClick={() => setActiveTab('returns')}
        >
          Return Requests ({returnRequests.length})
        </button>
      </div>

      {/* Current Assets Tab */}
      {activeTab === 'current' && (
        <div className="table-responsive">
          {assignedAssets.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
              No assets currently checked out to this employee.
            </p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset Tag</th>
                  <th>Name & Type</th>
                  <th>Condition</th>
                  <th>Checked Out</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {assignedAssets.map((item) => (
                  <tr key={item.assignmentId || item.id}>
                    <td>
                      <span className="cell-code">{item.asset_tag}</span>
                    </td>
                    <td>
                      <span className="cell-title">{item.name || item.asset_type}</span>
                      <span className="cell-subtext">{item.asset_type} {item.model ? `• ${item.model}` : ''}</span>
                    </td>
                    <td>{item.condition_at_assignment || 'Good'}</td>
                    <td>{formatDate(item.assigned_at)}</td>
                    <td style={{ textAlign: 'right' }}>
                      {onReturnAssetClick && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            onClose();
                            onReturnAssetClick(item);
                          }}
                        >
                          Return Asset
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Assignment History Tab */}
      {activeTab === 'history' && (
        <div className="table-responsive">
          {assignmentHistory.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
              No previous assignments recorded for this employee.
            </p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Checkout Date</th>
                  <th>Check-in Date</th>
                  <th>Condition on Return</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {assignmentHistory.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className="cell-code">{item.asset_tag || `Asset #${item.asset_id}`}</span>
                      <span className="cell-subtext">{item.asset_name || ''}</span>
                    </td>
                    <td>{formatDate(item.assigned_at)}</td>
                    <td>{item.returned_at ? formatDate(item.returned_at) : 'Active Checkout'}</td>
                    <td>{item.condition_at_return || '—'}</td>
                    <td>
                      <StatusBadge status={item.returned_at ? 'Available' : 'Assigned'} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Return Requests Tab */}
      {activeTab === 'returns' && (
        <div className="table-responsive">
          {returnRequests.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
              No return requests filed by or for this employee.
            </p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Requested Date</th>
                  <th>Reason / Notes</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {returnRequests.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <span className="cell-code">{req.asset_tag || `Asset #${req.asset_id}`}</span>
                      <span className="cell-subtext">{req.asset_name || ''}</span>
                    </td>
                    <td>{formatDate(req.requested_at)}</td>
                    <td>{req.notes || '—'}</td>
                    <td>
                      <StatusBadge status={req.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </Modal>
  );
}
