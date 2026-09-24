import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import AssetTable from '../components/assets/AssetTable';
import AssetFilters from '../components/assets/AssetFilters';
import AssetForm from '../components/assets/AssetForm';
import AssetDetails from '../components/assets/AssetDetails';
import SearchBar from '../components/common/SearchBar';
import Button from '../components/common/Button';
import Pagination from '../components/common/Pagination';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import AssignmentForm from '../components/assignments/AssignmentForm';
import ServiceForm from '../components/services/ServiceForm';
import { useToast } from '../context/ToastContext';
import { assetService } from '../services/assetService';
import { assignmentService } from '../services/assignmentService';
import { employeeService } from '../services/employeeService';
import { serviceRecordService } from '../services/serviceRecordService';

const PAGE_SIZE = 10;

export default function Assets() {
  const { id: urlAssetId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();

  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    status: searchParams.get('status') || '',
    asset_type: '',
    category: '',
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [detailsAsset, setDetailsAsset] = useState(null);
  const [deletingAsset, setDeletingAsset] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Quick Action Modals from Details
  const [assigningAsset, setAssigningAsset] = useState(null);
  const [servicingAsset, setServicingAsset] = useState(null);

  // Fetch initial data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [assetsData, empsData, assignsData] = await Promise.all([
        assetService.getAssets({
          search,
          status: filters.status,
          asset_type: filters.asset_type,
          category: filters.category,
        }),
        employeeService.getEmployees(),
        assignmentService.getAssignments({ active_only: true }),
      ]);

      setAssets(assetsData || []);
      setEmployees(empsData || []);
      setAssignments(assignsData || []);
    } catch (err) {
      console.error('Error fetching assets:', err);
      setError(err.message || 'Failed to load assets.');
    } finally {
      setLoading(false);
    }
  }, [search, filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle URL query changes (e.g. from Dashboard stat cards)
  useEffect(() => {
    const urlStatus = searchParams.get('status') || '';
    setFilters((prev) => (prev.status !== urlStatus ? { ...prev, status: urlStatus } : prev));
  }, [searchParams]);

  // Handle direct navigation to /assets/:id
  useEffect(() => {
    if (urlAssetId) {
      assetService
        .getAsset(urlAssetId)
        .then((data) => {
          if (data) setDetailsAsset(data);
        })
        .catch((err) => console.error('Error loading asset by ID param:', err));
    }
  }, [urlAssetId]);

  function handleFilterChange(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
    if (key === 'status') {
      if (value) setSearchParams({ status: value });
      else setSearchParams({});
    }
  }

  function handleClearFilters() {
    setFilters({ status: '', asset_type: '', category: '' });
    setSearch('');
    setCurrentPage(1);
    setSearchParams({});
  }

  // Build active custodian map: asset_id -> employee details
  const custodianMap = new Map();
  const empMap = new Map(employees.map((e) => [e.id, e]));
  assignments.forEach((assign) => {
    if (!assign.returned_at && empMap.has(assign.employee_id)) {
      const emp = empMap.get(assign.employee_id);
      custodianMap.set(assign.asset_id, {
        ...emp,
        assignment_id: assign.id,
        assigned_at: assign.assigned_at,
        condition_at_assignment: assign.condition_at_assignment,
      });
    }
  });

  // Client-side pagination slicing
  const totalItems = assets.length;
  const paginatedAssets = assets.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Create or Update Asset Submit
  async function handleFormSubmit(payload) {
    setActionLoading(true);
    try {
      if (editingAsset) {
        await assetService.updateAsset(editingAsset.id, payload);
        addToast(`Asset '${payload.asset_tag}' updated successfully.`, 'success');
      } else {
        await assetService.createAsset(payload);
        addToast(`Asset '${payload.asset_tag}' registered successfully.`, 'success');
      }
      setFormOpen(false);
      setEditingAsset(null);
      await loadData();
    } finally {
      setActionLoading(false);
    }
  }

  // Delete Asset
  async function handleDeleteConfirm() {
    if (!deletingAsset) return;
    setActionLoading(true);
    try {
      await assetService.deleteAsset(deletingAsset.id);
      addToast(`Asset '${deletingAsset.asset_tag}' deleted successfully.`, 'success');
      setDeletingAsset(null);
      await loadData();
    } catch (err) {
      addToast(err.message || 'Failed to delete asset.', 'error');
    } finally {
      setActionLoading(false);
    }
  }

  // Quick Assign Asset
  async function handleQuickAssignSubmit(payload) {
    setActionLoading(true);
    try {
      await assignmentService.createAssignment(payload);
      addToast('Asset assigned to employee successfully.', 'success');
      setAssigningAsset(null);
      await loadData();
    } finally {
      setActionLoading(false);
    }
  }

  // Quick Return Request (State Machine: Assigned -> Return Requested)
  async function handleQuickReturnRequest(asset) {
    const activeCust = custodianMap.get(asset.id);
    if (!activeCust || !activeCust.assignment_id) {
      addToast(`No active checkout assignment found for ${asset.asset_tag}.`, 'error');
      return;
    }
    setActionLoading(true);
    try {
      await assignmentService.createReturnRequest({
        asset_id: asset.id,
        employee_id: activeCust.id,
        assignment_id: activeCust.assignment_id,
        notes: 'Return request submitted via asset management console',
      });
      addToast(`Return request initiated for ${asset.asset_tag}. Status updated to Return Requested.`, 'success');
      setDetailsAsset(null);
      await loadData();
    } catch (err) {
      addToast(err.message || 'Failed to submit return request.', 'error');
    } finally {
      setActionLoading(false);
    }
  }

  // Quick Service Asset (State Machine: -> In Repair)
  async function handleQuickServiceSubmit(payload) {
    setActionLoading(true);
    try {
      await serviceRecordService.createServiceRecord(payload);
      addToast('Maintenance ticket created and asset moved to In Repair.', 'success');
      setServicingAsset(null);
      await loadData();
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <h1>Asset Inventory</h1>
          <p>Search, allocate, inspect, and maintain company hardware and licenses</p>
        </div>
        <div className="page-actions">
          <Button
            variant="primary"
            onClick={() => {
              setEditingAsset(null);
              setFormOpen(true);
            }}
          >
            + Register Asset
          </Button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadData} />}

      <div className="table-card">
        {/* Table Toolbar: Search & Filters */}
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <SearchBar
              value={search}
              onChange={(val) => {
                setSearch(val);
                setCurrentPage(1);
              }}
              placeholder="Search tag, serial, model..."
            />
            <AssetFilters
              filters={filters}
              onFilterChange={handleFilterChange}
              onClear={handleClearFilters}
            />
          </div>
          <div className="table-toolbar-right">
            <Button variant="subtle" size="sm" onClick={loadData} title="Refresh Table">
              ↻ Refresh
            </Button>
          </div>
        </div>

        {/* Table Content */}
        {loading ? (
          <Loading text="Loading asset catalog..." />
        ) : assets.length === 0 ? (
          <EmptyState
            title="No assets found"
            description={
              search || filters.status || filters.asset_type || filters.category
                ? 'No assets matched your search keyword or selected filters.'
                : 'No assets have been registered yet in the system.'
            }
            actionText={
              search || filters.status || filters.asset_type || filters.category
                ? 'Clear Filters'
                : 'Register First Asset'
            }
            onAction={
              search || filters.status || filters.asset_type || filters.category
                ? handleClearFilters
                : () => setFormOpen(true)
            }
          />
        ) : (
          <>
            <AssetTable
              assets={paginatedAssets}
              custodianMap={custodianMap}
              onView={(asset) => setDetailsAsset(asset)}
              onEdit={(asset) => {
                setEditingAsset(asset);
                setFormOpen(true);
              }}
              onDelete={(asset) => setDeletingAsset(asset)}
            />
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
              itemLabel="assets"
            />
          </>
        )}
      </div>

      {/* Asset Form (Create / Edit) Modal */}
      <AssetForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingAsset(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingAsset}
        loading={actionLoading}
      />

      {/* Asset Details Modal */}
      <AssetDetails
        asset={detailsAsset}
        isOpen={!!detailsAsset}
        onClose={() => setDetailsAsset(null)}
        custodian={detailsAsset ? custodianMap.get(detailsAsset.id) : null}
        onAssignClick={(asset) => setAssigningAsset(asset)}
        onReturnClick={handleQuickReturnRequest}
        onServiceClick={(asset) => setServicingAsset(asset)}
        onEditClick={(asset) => {
          setEditingAsset(asset);
          setFormOpen(true);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!deletingAsset}
        onClose={() => setDeletingAsset(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete Asset: ${deletingAsset?.asset_tag}`}
        message={`Are you sure you want to permanently delete '${deletingAsset?.name || deletingAsset?.asset_tag}'? This will remove its maintenance and status history.`}
        confirmText="Delete Asset"
        confirmVariant="danger"
        loading={actionLoading}
      />

      {/* Quick Assign Modal */}
      {assigningAsset && (
        <AssignmentForm
          isOpen={!!assigningAsset}
          onClose={() => setAssigningAsset(null)}
          onSubmit={handleQuickAssignSubmit}
          availableAssets={[assigningAsset]}
          employees={employees}
          preselectedAssetId={assigningAsset.id}
          loading={actionLoading}
        />
      )}

      {/* Quick Service Modal */}
      {servicingAsset && (
        <ServiceForm
          isOpen={!!servicingAsset}
          onClose={() => setServicingAsset(null)}
          onSubmit={handleQuickServiceSubmit}
          assets={[servicingAsset]}
          preselectedAssetId={servicingAsset.id}
          loading={actionLoading}
        />
      )}
    </div>
  );
}
