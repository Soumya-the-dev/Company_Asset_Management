import React, { useCallback, useEffect, useState } from 'react';
import AssignmentTable from '../components/assignments/AssignmentTable';
import AssignmentForm from '../components/assignments/AssignmentForm';
import ReturnRequest from '../components/assignments/ReturnRequest';
import Modal from '../components/common/Modal';
import SearchBar from '../components/common/SearchBar';
import Button from '../components/common/Button';
import Pagination from '../components/common/Pagination';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import StatusBadge from '../components/common/StatusBadge';
import { useToast } from '../context/ToastContext';
import { assignmentService } from '../services/assignmentService';
import { assetService } from '../services/assetService';
import { employeeService } from '../services/employeeService';
import { CONDITION_OPTIONS } from '../utils/constants';
import { formatDate } from '../utils/formatters';

const PAGE_SIZE = 10;

export default function Assignments() {
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'all' | 'requests' | 'timeline'
  const [assignments, setAssignments] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Pagination
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Selected asset for Custody Timeline tab
  const [selectedCustodyAssetId, setSelectedCustodyAssetId] = useState('');

  // Modals
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [returningAssignment, setReturningAssignment] = useState(null);
  const [requestingReturnAssignment, setRequestingReturnAssignment] = useState(null);
  const [requestReturnNotes, setRequestReturnNotes] = useState('');
  const [returnCondition, setReturnCondition] = useState('Good');
  const [returnNotes, setReturnNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [assignsData, returnsData, assetsData, empsData] = await Promise.all([
        assignmentService.getAssignments(),
        assignmentService.getReturnRequests(),
        assetService.getAssets({ limit: 200 }),
        employeeService.getEmployees({ limit: 200 }),
      ]);

      setAssignments(assignsData || []);
      setReturnRequests(returnsData || []);
      setAssets(assetsData || []);
      setEmployees(empsData || []);

      if (assetsData && assetsData.length > 0 && !selectedCustodyAssetId) {
        setSelectedCustodyAssetId(String(assetsData[0].id));
      }
    } catch (err) {
      console.error('Error fetching assignments data:', err);
      setError(err.message || 'Failed to load assignment records.');
    } finally {
      setLoading(false);
    }
  }, [selectedCustodyAssetId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Lookup maps
  const assetMap = new Map(assets.map((a) => [a.id, a]));
  const employeeMap = new Map(employees.map((e) => [e.id, e]));

  // Filter available assets for allocation (status === 'Available')
  const availableAssets = assets.filter(
    (a) => a.status.toLowerCase() === 'available'
  );

  // Filter based on active tab and search
  const filteredAssignments = assignments.filter((item) => {
    if (activeTab === 'active' && item.returned_at) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const asset = assetMap.get(item.asset_id);
      const employee = employeeMap.get(item.employee_id);

      const matchTag = asset?.asset_tag?.toLowerCase().includes(q);
      const matchAssetName = asset?.name?.toLowerCase().includes(q);
      const matchEmpName = employee?.name?.toLowerCase().includes(q);
      const matchEmpCode = employee?.employee_code?.toLowerCase().includes(q);

      return matchTag || matchAssetName || matchEmpName || matchEmpCode;
    }
    return true;
  });

  // Client-side pagination
  const totalItems = filteredAssignments.length;
  const paginatedAssignments = filteredAssignments.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Assign Asset Submit
  async function handleAssignSubmit(payload) {
    setActionLoading(true);
    try {
      await assignmentService.createAssignment(payload);
      addToast('Asset allocated to employee successfully.', 'success');
      setAssignModalOpen(false);
      await loadData();
    } catch (err) {
      addToast(err.message || 'Failed to assign asset.', 'error');
    } finally {
      setActionLoading(false);
    }
  }

  // Direct Return Submit (Assigned -> Available)
  async function handleDirectReturnSubmit(e) {
    e.preventDefault();
    if (!returningAssignment) return;
    setActionLoading(true);
    try {
      await assignmentService.returnAssignment(returningAssignment.id, {
        condition_at_return: returnCondition,
        notes: returnNotes,
      });
      addToast('Asset returned to available inventory.', 'success');
      setReturningAssignment(null);
      await loadData();
    } catch (err) {
      addToast(err.message || 'Failed to return asset.', 'error');
    } finally {
      setActionLoading(false);
    }
  }

  // Submit Return Request (Assigned -> Return Requested)
  async function handleRequestReturnSubmit(e) {
    e.preventDefault();
    if (!requestingReturnAssignment) return;
    setActionLoading(true);
    try {
      await assignmentService.createReturnRequest({
        asset_id: requestingReturnAssignment.asset_id,
        employee_id: requestingReturnAssignment.employee_id,
        assignment_id: requestingReturnAssignment.id,
        notes: requestReturnNotes || 'Return requested by employee/administrator',
      });
      addToast('Return request submitted. Asset moved to Return Requested state.', 'success');
      setRequestingReturnAssignment(null);
      setRequestReturnNotes('');
      await loadData();
    } catch (err) {
      addToast(err.message || 'Failed to file return request.', 'error');
    } finally {
      setActionLoading(false);
    }
  }

  // Return Request Actions (State transitions)
  async function handleApproveRequest(requestId, condition) {
    setActionLoading(true);
    try {
      await assignmentService.approveReturnRequest(requestId, condition);
      addToast('Return request approved. Asset returned to inventory as Available.', 'success');
      await loadData();
    } catch (err) {
      addToast(err.message || 'Failed to approve return request.', 'error');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleRejectRequest(requestId, reason) {
    setActionLoading(true);
    try {
      await assignmentService.rejectReturnRequest(requestId, reason);
      addToast('Return request rejected. Asset remains Assigned.', 'info');
      await loadData();
    } catch (err) {
      addToast(err.message || 'Failed to reject return request.', 'error');
    } finally {
      setActionLoading(false);
    }
  }

  // Custody history for selected asset in Timeline view
  const selectedAsset = assetMap.get(Number(selectedCustodyAssetId));
  const selectedAssetCustodyHistory = assignments
    .filter((a) => a.asset_id === Number(selectedCustodyAssetId))
    .sort((a, b) => new Date(a.assigned_at) - new Date(b.assigned_at));

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <h1>Asset Allocations & Custody</h1>
          <p>Assign company inventory to staff, process check-ins, and manage return requests</p>
        </div>
        <div className="page-actions">
          <Button
            variant="primary"
            onClick={() => setAssignModalOpen(true)}
            disabled={availableAssets.length === 0}
            title={availableAssets.length === 0 ? 'No assets available in inventory' : ''}
          >
            + Assign Asset
          </Button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadData} />}

      <div className="table-card">
        {/* Navigation Tabs */}
        <div style={{ padding: '0.75rem 1.25rem 0 1.25rem', borderBottom: '1px solid var(--border-default)' }}>
          <div className="tabs-nav" style={{ margin: 0 }}>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('active');
                setCurrentPage(1);
              }}
            >
              Active Checkouts ({assignments.filter((a) => !a.returned_at).length})
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('all');
                setCurrentPage(1);
              }}
            >
              All Custody Records ({assignments.length})
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('requests');
                setCurrentPage(1);
              }}
            >
              Pending Returns ({returnRequests.filter((r) => r.status.toUpperCase() === 'PENDING').length})
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('timeline');
              }}
            >
              Asset Custody History
            </button>
          </div>
        </div>

        {/* Toolbar (Only for assignment tables) */}
        {activeTab !== 'requests' && activeTab !== 'timeline' && (
          <div className="table-toolbar">
            <div className="table-toolbar-left">
              <SearchBar
                value={search}
                onChange={(val) => {
                  setSearch(val);
                  setCurrentPage(1);
                }}
                placeholder="Search by asset tag, name, employee..."
              />
            </div>
            <div className="table-toolbar-right">
              <Button variant="subtle" size="sm" onClick={loadData} title="Refresh Table">
                ↻ Refresh
              </Button>
            </div>
          </div>
        )}

        {/* Table Content */}
        {loading ? (
          <Loading text="Loading custody records..." />
        ) : activeTab === 'requests' ? (
          <ReturnRequest
            returnRequests={returnRequests}
            assetMap={assetMap}
            employeeMap={employeeMap}
            onApprove={handleApproveRequest}
            onReject={handleRejectRequest}
            loading={actionLoading}
          />
        ) : activeTab === 'timeline' ? (
          <div style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <label htmlFor="custody_asset_select" style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                Select Asset:
              </label>
              <select
                id="custody_asset_select"
                className="form-select"
                style={{ width: 'auto', minWidth: '280px' }}
                value={selectedCustodyAssetId}
                onChange={(e) => setSelectedCustodyAssetId(e.target.value)}
              >
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.asset_tag} — {asset.name || asset.model || asset.asset_type} ({asset.status})
                  </option>
                ))}
              </select>
              {selectedAsset && <StatusBadge status={selectedAsset.status} />}
            </div>

            {selectedAsset && (
              <div style={{ background: 'var(--bg-subtle)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem' }}>
                  {selectedAsset.name || `${selectedAsset.manufacturer || ''} ${selectedAsset.model || selectedAsset.asset_type}`}
                </h3>
                <span className="cell-code">{selectedAsset.asset_tag}</span>
                <span style={{ margin: '0 0.5rem', color: 'var(--text-muted)' }}>•</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  S/N: {selectedAsset.serial_number || 'N/A'} • {selectedAsset.category || 'General'}
                </span>
              </div>
            )}

            <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', fontWeight: 600 }}>
              Chronological Custody Timeline ({selectedAssetCustodyHistory.length} assignments)
            </h4>

            {selectedAssetCustodyHistory.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>
                This asset has not been assigned to any employee yet.
              </p>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Custodian Employee</th>
                      <th>Department</th>
                      <th>Checkout Date</th>
                      <th>Check-in Date</th>
                      <th>Condition at Checkout</th>
                      <th>Condition at Return</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedAssetCustodyHistory.map((assign, idx) => {
                      const emp = employeeMap.get(assign.employee_id);
                      return (
                        <tr key={assign.id}>
                          <td>
                            <strong>Assignment {idx + 1}</strong>
                          </td>
                          <td>
                            <span className="cell-title">{emp?.name || `Employee #${assign.employee_id}`}</span>
                            <span className="cell-subtext">{emp?.employee_code}</span>
                          </td>
                          <td>{emp?.department || '—'}</td>
                          <td>{formatDate(assign.assigned_at)}</td>
                          <td>{assign.returned_at ? formatDate(assign.returned_at) : <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Currently Active</span>}</td>
                          <td>{assign.condition_at_assignment || 'Good'}</td>
                          <td>{assign.condition_at_return || '—'}</td>
                          <td>
                            <StatusBadge status={assign.returned_at ? 'Available' : 'Assigned'} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : filteredAssignments.length === 0 ? (
          <EmptyState
            title="No assignments found"
            description={
              search
                ? 'No allocations match your search query.'
                : activeTab === 'active'
                ? 'There are currently no active asset checkouts.'
                : 'No assignment records found.'
            }
            actionText={availableAssets.length > 0 ? 'Assign First Asset' : null}
            onAction={() => setAssignModalOpen(true)}
          />
        ) : (
          <>
            <AssignmentTable
              assignments={paginatedAssignments}
              assetMap={assetMap}
              employeeMap={employeeMap}
              onReturnClick={(item) => {
                setReturningAssignment(item);
                setReturnCondition('Good');
                setReturnNotes('');
              }}
              onRequestReturnClick={(item) => {
                setRequestingReturnAssignment(item);
                setRequestReturnNotes('');
              }}
            />
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
              itemLabel="assignments"
            />
          </>
        )}
      </div>

      {/* Assignment Modal (New Allocation) */}
      <AssignmentForm
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onSubmit={handleAssignSubmit}
        availableAssets={availableAssets}
        employees={employees}
        loading={actionLoading}
      />

      {/* Direct Return Modal */}
      {returningAssignment && (
        <Modal
          isOpen={!!returningAssignment}
          onClose={actionLoading ? () => {} : () => setReturningAssignment(null)}
          title="Process Asset Check-in (Return)"
          size="sm"
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setReturningAssignment(null)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleDirectReturnSubmit}
                loading={actionLoading}
              >
                Confirm Return
              </Button>
            </>
          }
        >
          <form onSubmit={handleDirectReturnSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <span className="cell-code">
                {assetMap.get(returningAssignment.asset_id)?.asset_tag}
              </span>
              <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Checking in from custodian{' '}
                <strong>
                  {employeeMap.get(returningAssignment.employee_id)?.name}
                </strong>
                . This transitions status directly back to <strong>Available</strong>.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="direct_return_cond">
                Physical Condition on Return
              </label>
              <select
                id="direct_return_cond"
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

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="direct_return_notes">
                Return Notes / Inspection Observations
              </label>
              <textarea
                id="direct_return_notes"
                rows="3"
                className="form-textarea"
                placeholder="Include any accessories returned, scratches, or wear and tear observations..."
                value={returnNotes}
                onChange={(e) => setReturnNotes(e.target.value)}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Request Return Modal (State transition: Assigned -> Return Requested) */}
      {requestingReturnAssignment && (
        <Modal
          isOpen={!!requestingReturnAssignment}
          onClose={actionLoading ? () => {} : () => setRequestingReturnAssignment(null)}
          title="Submit Return Request"
          size="sm"
          footer={
            <>
              <Button
                variant="secondary"
                onClick={() => setRequestingReturnAssignment(null)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleRequestReturnSubmit}
                loading={actionLoading}
              >
                Submit Return Request
              </Button>
            </>
          }
        >
          <form onSubmit={handleRequestReturnSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <span className="cell-code">
                {assetMap.get(requestingReturnAssignment.asset_id)?.asset_tag}
              </span>
              <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Custodian: <strong>{employeeMap.get(requestingReturnAssignment.employee_id)?.name}</strong>
              </p>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Submitting this request will transition the asset status from <strong>Assigned</strong> to <strong>Return Requested</strong> until reviewed by IT.
              </p>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="req_return_notes">
                Reason for Return Request <span className="required">*</span>
              </label>
              <textarea
                id="req_return_notes"
                rows="3"
                className="form-textarea"
                placeholder="e.g. Employee project completed, departing company, or requested hardware upgrade..."
                value={requestReturnNotes}
                onChange={(e) => setRequestReturnNotes(e.target.value)}
                required
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
