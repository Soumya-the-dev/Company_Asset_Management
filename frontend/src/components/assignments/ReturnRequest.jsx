import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import StatusBadge from '../common/StatusBadge';
import { formatDate } from '../../utils/formatters';
import { CONDITION_OPTIONS } from '../../utils/constants';

export default function ReturnRequest({
  returnRequests = [],
  assetMap = new Map(),
  employeeMap = new Map(),
  onApprove,
  onReject,
  loading = false,
}) {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState(null); // 'approve' | 'reject'
  const [returnCondition, setReturnCondition] = useState('Good');
  const [rejectReason, setRejectReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function openActionModal(req, type) {
    setSelectedRequest(req);
    setActionType(type);
    setReturnCondition('Good');
    setRejectReason('');
  }

  function closeActionModal() {
    setSelectedRequest(null);
    setActionType(null);
    setReturnCondition('Good');
    setRejectReason('');
  }

  async function handleConfirmAction() {
    if (!selectedRequest) return;
    setSubmitting(true);
    try {
      if (actionType === 'approve') {
        await onApprove(selectedRequest.id, returnCondition);
      } else {
        await onReject(selectedRequest.id, rejectReason);
      }
      closeActionModal();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="table-responsive">
        <table className="data-table" aria-label="Return Requests Table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Employee</th>
              <th>Request Date</th>
              <th>Notes / Reason</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {returnRequests.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  No pending return requests in the queue.
                </td>
              </tr>
            ) : (
              returnRequests.map((req) => {
                const asset = assetMap.get(req.asset_id);
                const employee = employeeMap.get(req.employee_id);
                const isPending = req.status.toUpperCase() === 'PENDING';

                return (
                  <tr key={req.id}>
                    <td>
                      <span className="cell-code">{asset?.asset_tag || `ID: ${req.asset_id}`}</span>
                      <span className="cell-title" style={{ display: 'block', fontSize: '0.825rem' }}>
                        {asset?.name || asset?.asset_type || '—'}
                      </span>
                    </td>
                    <td>
                      <span className="cell-title">{employee?.name || `Employee #${req.employee_id}`}</span>
                      <span className="cell-subtext">{employee?.department || '—'}</span>
                    </td>
                    <td>{formatDate(req.requested_at)}</td>
                    <td>{req.notes || '—'}</td>
                    <td>
                      <StatusBadge status={req.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {isPending ? (
                        <div className="cell-actions">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => openActionModal(req, 'approve')}
                            disabled={loading}
                          >
                            Approve Return
                          </Button>
                          <Button
                            variant="subtle"
                            size="sm"
                            style={{ color: 'var(--danger)' }}
                            onClick={() => openActionModal(req, 'reject')}
                            disabled={loading}
                          >
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          Processed
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Approve / Reject Modal */}
      {selectedRequest && (
        <Modal
          isOpen={!!selectedRequest}
          onClose={submitting ? () => {} : closeActionModal}
          title={
            actionType === 'approve'
              ? 'Approve Asset Return'
              : 'Reject Return Request'
          }
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={closeActionModal} disabled={submitting}>
                Cancel
              </Button>
              <Button
                variant={actionType === 'approve' ? 'primary' : 'danger'}
                onClick={handleConfirmAction}
                loading={submitting}
              >
                {actionType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </Button>
            </>
          }
        >
          {actionType === 'approve' ? (
            <div>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Approving this return will mark the assignment as returned and transition the asset status back to <strong>Available</strong>.
              </p>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="return_cond">
                  Asset Condition Upon Physical Return
                </label>
                <select
                  id="return_cond"
                  className="form-select"
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value)}
                >
                  {CONDITION_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Rejecting this request will keep the asset status as <strong>Assigned</strong> to the employee.
              </p>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" htmlFor="reject_reason">
                  Reason for Rejection
                </label>
                <textarea
                  id="reject_reason"
                  rows="3"
                  className="form-textarea"
                  placeholder="e.g. Project ongoing until next month."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
