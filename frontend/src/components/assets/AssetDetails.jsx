import React, { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import StatusBadge from '../common/StatusBadge';
import Loading from '../common/Loading';
import { formatDate, formatDateTime, formatCurrency } from '../../utils/formatters';
import { assetService } from '../../services/assetService';
import { assignmentService } from '../../services/assignmentService';
import { serviceRecordService } from '../../services/serviceRecordService';

export default function AssetDetails({
  asset,
  isOpen,
  onClose,
  custodian = null,
  onAssignClick,
  onReturnClick,
  onServiceClick,
  onEditClick,
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [statusHistory, setStatusHistory] = useState([]);
  const [assignmentHistory, setAssignmentHistory] = useState([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    if (asset?.id && isOpen) {
      setLoadingDetails(true);
      Promise.all([
        assetService.getAssetHistory(asset.id).catch(() => []),
        assignmentService.getAssignments({ asset_id: asset.id }).catch(() => []),
        serviceRecordService.getServiceRecords({ asset_id: asset.id }).catch(() => []),
      ])
        .then(([histData, assignData, servData]) => {
          setStatusHistory(histData || []);
          setAssignmentHistory(assignData || []);
          setMaintenanceHistory(servData || []);
        })
        .finally(() => setLoadingDetails(false));
    }
  }, [asset?.id, isOpen]);

  if (!asset) return null;

  const status = (asset.status || '').toLowerCase();
  const isAvailable = status === 'available';
  const isAssigned = status === 'assigned';
  const isInRepair = status === 'in repair' || status === 'in_repair';
  const isReturnRequested = status === 'return requested' || status === 'return_requested';
  const isRetired = status === 'retired';
  const isSoftwareLicense = asset.asset_type === 'Software License';

  function handleCopyLicenseKey(key) {
    if (!key) return;
    navigator.clipboard?.writeText(key).then(() => {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Asset Details: ${asset.asset_tag}`}
      size="lg"
      footer={
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* Deterministic State Machine Action Controls */}
            {isAvailable && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  onAssignClick(asset);
                }}
              >
                + Assign Asset
              </Button>
            )}

            {isAssigned && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  onClose();
                  onReturnClick(asset);
                }}
              >
                🔄 Process Return / Request
              </Button>
            )}

            {isReturnRequested && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  onClose();
                  onReturnClick(asset);
                }}
              >
                Review Return Request
              </Button>
            )}

            {!isInRepair && !isRetired && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  onClose();
                  onServiceClick(asset);
                }}
              >
                🛠️ Log Maintenance
              </Button>
            )}

            {isInRepair && (
              <span style={{ fontSize: '0.8125rem', color: 'var(--warning-text)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                ⚠️ Asset is In Repair. Service ticket open.
              </span>
            )}

            {isRetired && (
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                Asset is retired from service.
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onClose();
                onEditClick(asset);
              }}
            >
              Edit Asset
            </Button>
            <Button variant="subtle" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      }
    >
      {/* State Machine Transition Indicator */}
      <div
        style={{
          background: 'var(--bg-subtle)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
            State Machine Node:
          </span>
          <StatusBadge status={asset.status} />
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          {isAvailable && <span>Valid Transitions: <strong>Assigned</strong> (via checkout) • <strong>In Repair</strong> • <strong>Retired</strong></span>}
          {isAssigned && <span>Valid Transitions: <strong>Return Requested</strong> (via employee) • <strong>Available</strong> (direct check-in)</span>}
          {isReturnRequested && <span>Valid Transitions: <strong>Available</strong> (approve) • <strong>Assigned</strong> (reject)</span>}
          {isInRepair && <span>Valid Transitions: <strong>Available</strong> (upon maintenance resolution)</span>}
          {isRetired && <span>Terminal State (Decommissioned)</span>}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs-nav">
        <button
          type="button"
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          General Information
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'custody' ? 'active' : ''}`}
          onClick={() => setActiveTab('custody')}
        >
          Current Custodian
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          Custody History ({assignmentHistory.length})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'maintenance' ? 'active' : ''}`}
          onClick={() => setActiveTab('maintenance')}
        >
          Maintenance ({maintenanceHistory.length})
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          State Audit Log ({statusHistory.length})
        </button>
      </div>

      {loadingDetails ? (
        <Loading text="Loading detailed asset history..." />
      ) : (
        <>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.2rem', fontWeight: 700 }}>
                    {asset.name || `${asset.manufacturer || ''} ${asset.model || asset.asset_type}`}
                  </h3>
                  <span className="cell-code">{asset.asset_tag}</span>
                </div>
                <StatusBadge status={asset.status} />
              </div>

              {/* Software License Quota & Key Section */}
              {isSoftwareLicense && (
                <div
                  style={{
                    background: 'var(--primary-subtle)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1rem',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>🔑</span>
                    <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      Software License & Seat Quota Details
                    </strong>
                  </div>
                  <div className="detail-grid" style={{ marginBottom: 0 }}>
                    <div className="detail-item">
                      <span className="detail-label">License Key</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="detail-value" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                          {asset.license_key || asset.serial_number || 'N/A'}
                        </span>
                        {(asset.license_key || asset.serial_number) && (
                          <button
                            type="button"
                            className="btn btn-subtle btn-sm"
                            style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem' }}
                            onClick={() => handleCopyLicenseKey(asset.license_key || asset.serial_number)}
                          >
                            {copiedKey ? '✓ Copied' : 'Copy'}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Seat Quota</span>
                      <span className="detail-value" style={{ fontWeight: 600 }}>
                        {asset.seat_quota || asset.seat_count || (asset.model && asset.model.includes('Seat') ? asset.model : '1 Seat')}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Renewal Date</span>
                      <span className="detail-value">{formatDate(asset.renewal_date)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Expiration Date</span>
                      <span className="detail-value">{formatDate(asset.expiration_date)}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Asset Type</span>
                  <span className="detail-value">{asset.asset_type}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Category</span>
                  <span className="detail-value">{asset.category || 'General'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">{isSoftwareLicense ? 'Publisher / Vendor' : 'Brand / Manufacturer'}</span>
                  <span className="detail-value">{asset.manufacturer || '—'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">{isSoftwareLicense ? 'Edition / Tier' : 'Model'}</span>
                  <span className="detail-value">{asset.model || '—'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">{isSoftwareLicense ? 'License Identifier' : 'Serial Number'}</span>
                  <span className="detail-value" style={{ fontFamily: 'var(--font-mono)' }}>
                    {asset.serial_number || '—'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Purchase Date</span>
                  <span className="detail-value">{formatDate(asset.purchase_date)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Purchase Cost</span>
                  <span className="detail-value">{formatCurrency(asset.purchase_cost)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">{isSoftwareLicense ? 'Support / Expiry' : 'Warranty Expiry'}</span>
                  <span className="detail-value">{formatDate(asset.warranty_expiry || asset.warranty || asset.expiration_date)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Registered On</span>
                  <span className="detail-value">{formatDate(asset.created_at)}</span>
                </div>
              </div>

              <hr className="section-divider" />

              <div>
                <span className="detail-label">Specifications & Description</span>
                <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {asset.description || asset.specifications || 'No detailed specifications recorded for this asset.'}
                </p>
              </div>
            </div>
          )}

          {/* Current Custodian Tab */}
          {activeTab === 'custody' && (
            <div>
              {custodian ? (
                <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                      }}
                    >
                      {custodian.name?.charAt(0) || 'E'}
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{custodian.name}</h4>
                      <span className="cell-subtext">{custodian.employee_code} • {custodian.email}</span>
                    </div>
                  </div>

                  <div className="detail-grid" style={{ marginBottom: 0 }}>
                    <div className="detail-item">
                      <span className="detail-label">Department</span>
                      <span className="detail-value">{custodian.department || '—'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Designation</span>
                      <span className="detail-value">{custodian.designation || '—'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Assigned Since</span>
                      <span className="detail-value">{formatDateTime(custodian.assigned_at)}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Condition At Allocation</span>
                      <span className="detail-value">{custodian.condition_at_assignment || 'Good'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.95rem' }}>
                    This asset is currently in inventory and not allocated to any employee.
                  </p>
                  {isAvailable && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        onClose();
                        onAssignClick(asset);
                      }}
                    >
                      Assign to Employee Now
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Assignment / Custody History Tab */}
          {activeTab === 'assignments' && (
            <div className="table-responsive">
              {assignmentHistory.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                  No previous assignment records found for this asset.
                </p>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Assignment ID</th>
                      <th>Custodian ID</th>
                      <th>Checkout Date</th>
                      <th>Check-in Date</th>
                      <th>Checkout Condition</th>
                      <th>Return Condition</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assignmentHistory.map((item) => (
                      <tr key={item.id}>
                        <td>#{item.id}</td>
                        <td>
                          <span className="cell-title">Employee #{item.employee_id}</span>
                        </td>
                        <td>{formatDate(item.assigned_at)}</td>
                        <td>{item.returned_at ? formatDate(item.returned_at) : <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Active</span>}</td>
                        <td>{item.condition_at_assignment || 'Good'}</td>
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

          {/* Maintenance History Tab */}
          {activeTab === 'maintenance' && (
            <div className="table-responsive">
              {maintenanceHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                  <p style={{ margin: '0 0 0.75rem 0' }}>No maintenance records logged for this asset.</p>
                  {!isRetired && !isInRepair && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        onClose();
                        onServiceClick(asset);
                      }}
                    >
                      Log Maintenance Ticket
                    </Button>
                  )}
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Ticket</th>
                      <th>Service Type</th>
                      <th>Provider / Vendor</th>
                      <th>Cost</th>
                      <th>Service Date</th>
                      <th>Resolution Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceHistory.map((ticket) => (
                      <tr key={ticket.id}>
                        <td>#{ticket.id}</td>
                        <td>
                          <span className="cell-title">{ticket.service_type}</span>
                          <span className="cell-subtext">{ticket.description}</span>
                        </td>
                        <td>{ticket.service_provider || 'In-House IT'}</td>
                        <td>{formatCurrency(ticket.cost)}</td>
                        <td>{formatDate(ticket.service_date)}</td>
                        <td>{formatDate(ticket.completed_date)}</td>
                        <td>
                          <StatusBadge status={ticket.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Status Audit Log Tab */}
          {activeTab === 'history' && (
            <div>
              {statusHistory.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                  No previous status transition logs found for this asset.
                </p>
              ) : (
                <div className="timeline">
                  {statusHistory.map((item) => (
                    <div key={item.id} className="timeline-item">
                      <div className="timeline-marker" />
                      <div className="timeline-title">
                        Status changed to <StatusBadge status={item.new_status} />
                      </div>
                      <div className="timeline-date">{formatDateTime(item.changed_at)}</div>
                      <div className="timeline-body">
                        {item.reason || `Transitioned from ${item.old_status} to ${item.new_status}`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
