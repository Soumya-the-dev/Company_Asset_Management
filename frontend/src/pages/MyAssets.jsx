import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { assetService } from '../services/assetService';
import { assignmentService } from '../services/assignmentService';
import StatusBadge from '../components/common/StatusBadge';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import { formatDate } from '../utils/formatters';

export default function MyAssets() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeAssignments, setActiveAssignments] = useState([]);
  const [historyAssignments, setHistoryAssignments] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Return request modal
  const [requestingAsset, setRequestingAsset] = useState(null);
  const [returnNotes, setReturnNotes] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);

  const loadEmployeeData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [allAssigns, allReturns, allAssets] = await Promise.all([
        assignmentService.getAssignments({ employee_id: user.id }),
        assignmentService.getReturnRequests({ employee_id: user.id }),
        assetService.getAssets({ limit: 100 }),
      ]);

      const myAssigns = (allAssigns || []).filter((a) => a.employee_id === user.id);
      setActiveAssignments(myAssigns.filter((a) => !a.returned_at));
      setHistoryAssignments(myAssigns.filter((a) => a.returned_at));
      setReturnRequests((allReturns || []).filter((r) => r.employee_id === user.id));
      setAssets(allAssets || []);
    } catch (err) {
      console.error('Error loading employee asset data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadEmployeeData();
  }, [loadEmployeeData]);

  const assetMap = new Map(assets.map((a) => [a.id, a]));

  async function handleRequestReturnSubmit(e) {
    e.preventDefault();
    if (!requestingAsset) return;
    setSubmittingReturn(true);
    try {
      await assignmentService.createReturnRequest({
        asset_id: requestingAsset.asset_id,
        employee_id: user.id,
        assignment_id: requestingAsset.id,
        notes: returnNotes || 'Return requested by employee via Employee Portal',
      });
      addToast('Return request filed successfully. IT will review and approve.', 'success');
      setRequestingAsset(null);
      setReturnNotes('');
      await loadEmployeeData();
    } catch (err) {
      addToast(err.message || 'Failed to submit return request.', 'error');
    } finally {
      setSubmittingReturn(false);
    }
  }

  if (loading) {
    return <Loading text="Loading your assigned assets and custody records..." />;
  }

  return (
    <div>
      {/* Employee Profile Header */}
      <div className="page-header">
        <div className="page-header-info">
          <h1>My Custody & Assigned Equipment</h1>
          <p>
            Welcome, <strong>{user?.name}</strong> ({user?.employee_code}) • {user?.department || 'Staff'} • {user?.designation || 'Team Member'}
          </p>
        </div>
        <div className="page-actions">
          <Button variant="secondary" size="sm" onClick={loadEmployeeData}>
            ↻ Refresh My Equipment
          </Button>
        </div>
      </div>

      {/* KPI Cards for Employee */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Currently in My Custody</span>
            <div className="stat-card-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
              💻
            </div>
          </div>
          <div className="stat-card-value">{activeAssignments.length}</div>
          <div className="stat-card-subtitle">Active hardware & licenses</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Pending Return Requests</span>
            <div className="stat-card-icon" style={{ background: '#faf5ff', color: '#7c3aed' }}>
              🔄
            </div>
          </div>
          <div className="stat-card-value">
            {returnRequests.filter((r) => r.status.toUpperCase() === 'PENDING').length}
          </div>
          <div className="stat-card-subtitle">Awaiting IT verification</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Completed Past Custody</span>
            <div className="stat-card-icon" style={{ background: '#eff6ff', color: '#2563eb' }}>
              📁
            </div>
          </div>
          <div className="stat-card-value">{historyAssignments.length}</div>
          <div className="stat-card-subtitle">Checked in previously</div>
        </div>
      </div>

      {/* Section 1: Active Equipment */}
      <div className="table-card" style={{ marginBottom: '1.5rem' }}>
        <div className="table-toolbar">
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Active Company Equipment in My Custody</h3>
        </div>

        {activeAssignments.length === 0 ? (
          <EmptyState
            title="No equipment currently checked out"
            description="You do not have any company hardware or licenses currently assigned to your profile."
            icon="📦"
          />
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Asset Tag</th>
                  <th>Equipment Title & Type</th>
                  <th>Serial / License Key</th>
                  <th>Checkout Date</th>
                  <th>Condition on Checkout</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {activeAssignments.map((assign) => {
                  const asset = assetMap.get(assign.asset_id);
                  const isReturnPending = asset?.status.toLowerCase() === 'return requested';

                  return (
                    <tr key={assign.id}>
                      <td>
                        <span className="cell-code">{asset?.asset_tag || `Asset #${assign.asset_id}`}</span>
                      </td>
                      <td>
                        <span className="cell-title">{asset?.name || asset?.asset_type}</span>
                        <span className="cell-subtext">{asset?.asset_type} {asset?.model ? `• ${asset?.model}` : ''}</span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                          {asset?.license_key || asset?.serial_number || '—'}
                        </span>
                      </td>
                      <td>{formatDate(assign.assigned_at)}</td>
                      <td>{assign.condition_at_assignment || 'Good'}</td>
                      <td>
                        <StatusBadge status={asset?.status || 'Assigned'} />
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {isReturnPending ? (
                          <span style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600 }}>
                            Return Pending Review
                          </span>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setRequestingAsset(assign);
                              setReturnNotes('');
                            }}
                          >
                            Request Return
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 2: Return Requests & Past Custody History */}
      <div className="table-card">
        <div className="table-toolbar">
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>My Return Requests & Past Custody History</h3>
        </div>

        <div className="table-responsive">
          {returnRequests.length === 0 && historyAssignments.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '1.75rem', color: 'var(--text-muted)' }}>
              No historical return requests or check-ins recorded.
            </p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Asset</th>
                  <th>Date</th>
                  <th>Notes / Status Details</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {/* Active and past return requests */}
                {returnRequests.map((req) => {
                  const asset = assetMap.get(req.asset_id);
                  return (
                    <tr key={`req-${req.id}`}>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Return Request</span>
                      </td>
                      <td>
                        <span className="cell-code">{asset?.asset_tag}</span>
                        <span className="cell-subtext">{asset?.name}</span>
                      </td>
                      <td>{formatDate(req.requested_at)}</td>
                      <td>{req.notes || 'No notes provided'}</td>
                      <td>
                        <StatusBadge status={req.status} />
                      </td>
                    </tr>
                  );
                })}

                {/* Past checked in assignments */}
                {historyAssignments.map((h) => {
                  const asset = assetMap.get(h.asset_id);
                  return (
                    <tr key={`hist-${h.id}`}>
                      <td>
                        <span style={{ color: 'var(--text-muted)' }}>Past Checkout</span>
                      </td>
                      <td>
                        <span className="cell-code">{asset?.asset_tag}</span>
                        <span className="cell-subtext">{asset?.name}</span>
                      </td>
                      <td>{formatDate(h.returned_at)}</td>
                      <td>Returned in {h.condition_at_return || 'Good'} condition</td>
                      <td>
                        <StatusBadge status="Available" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal for Requesting Return */}
      {requestingAsset && (
        <Modal
          isOpen={!!requestingAsset}
          onClose={submittingReturn ? () => {} : () => setRequestingAsset(null)}
          title={`Request Return: ${assetMap.get(requestingAsset.asset_id)?.asset_tag}`}
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setRequestingAsset(null)} disabled={submittingReturn}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleRequestReturnSubmit} loading={submittingReturn}>
                Submit Return Request
              </Button>
            </>
          }
        >
          <form onSubmit={handleRequestReturnSubmit}>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Requesting a return informs IT operations to inspect and accept this equipment back into company inventory.
            </p>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="emp_return_notes">
                Reason for Return
              </label>
              <textarea
                id="emp_return_notes"
                rows="3"
                className="form-textarea"
                placeholder="e.g. Project concluded, hardware upgrade, or switching to new office location..."
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
