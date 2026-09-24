import React, { useCallback, useEffect, useState } from 'react';
import ServiceTable from '../components/services/ServiceTable';
import ServiceForm from '../components/services/ServiceForm';
import ServiceDetails from '../components/services/ServiceDetails';
import SearchBar from '../components/common/SearchBar';
import Button from '../components/common/Button';
import Pagination from '../components/common/Pagination';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import { useToast } from '../context/ToastContext';
import { serviceRecordService } from '../services/serviceRecordService';
import { assetService } from '../services/assetService';
import { SERVICE_STATUSES } from '../utils/constants';

const PAGE_SIZE = 10;

export default function Services() {
  const { addToast } = useToast();

  const [records, setRecords] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [detailsRecord, setDetailsRecord] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [recordsData, assetsData] = await Promise.all([
        serviceRecordService.getServiceRecords({ status: statusFilter }),
        assetService.getAssets({ limit: 200 }),
      ]);

      setRecords(recordsData || []);
      setAssets(assetsData || []);
    } catch (err) {
      console.error('Error fetching maintenance records:', err);
      setError(err.message || 'Failed to load maintenance records.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const assetMap = new Map(assets.map((a) => [a.id, a]));

  // Search filter
  const filteredRecords = records.filter((rec) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const asset = assetMap.get(rec.asset_id);
    return (
      rec.service_type?.toLowerCase().includes(q) ||
      rec.description?.toLowerCase().includes(q) ||
      rec.service_provider?.toLowerCase().includes(q) ||
      asset?.asset_tag?.toLowerCase().includes(q) ||
      asset?.name?.toLowerCase().includes(q)
    );
  });

  // Client-side pagination
  const totalItems = filteredRecords.length;
  const paginatedRecords = filteredRecords.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  // Form Submit
  async function handleFormSubmit(payload) {
    setActionLoading(true);
    try {
      if (editingRecord) {
        await serviceRecordService.updateServiceRecord(
          editingRecord.id,
          payload,
          payload.status?.toUpperCase() === 'COMPLETED'
        );
        addToast('Maintenance ticket updated successfully.', 'success');
      } else {
        await serviceRecordService.createServiceRecord(payload);
        addToast('Maintenance ticket created. Asset transitioned to In Repair.', 'success');
      }
      setFormOpen(false);
      setEditingRecord(null);
      await loadData();
    } catch (err) {
      addToast(err.message || 'Failed to save maintenance ticket.', 'error');
    } finally {
      setActionLoading(false);
    }
  }

  // Quick Resolve / Complete
  async function handleCompleteRecord(record) {
    setActionLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      await serviceRecordService.updateServiceRecord(
        record.id,
        {
          status: 'COMPLETED',
          completed_date: today,
        },
        true // returnAssetToAvailable
      );
      addToast(`Ticket #${record.id} marked as completed. Asset returned to Available inventory.`, 'success');
      if (detailsRecord?.id === record.id) {
        setDetailsRecord(null);
      }
      await loadData();
    } catch (err) {
      addToast(err.message || 'Failed to resolve maintenance ticket.', 'error');
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-header-info">
          <h1>Maintenance & Service Records</h1>
          <p>Track hardware repairs, warranty diagnostics, periodic servicing, and vendor costs</p>
        </div>
        <div className="page-actions">
          <Button
            variant="primary"
            onClick={() => {
              setEditingRecord(null);
              setFormOpen(true);
            }}
          >
            + Create Service Ticket
          </Button>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={loadData} />}

      <div className="table-card">
        {/* Toolbar */}
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <SearchBar
              value={search}
              onChange={(val) => {
                setSearch(val);
                setCurrentPage(1);
              }}
              placeholder="Search ticket, provider, asset tag..."
            />
            <select
              className="form-select"
              style={{ width: 'auto', minWidth: '140px', padding: '0.4rem 0.65rem', fontSize: '0.8125rem' }}
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Filter by Status"
            >
              <option value="">All Statuses</option>
              {SERVICE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            {(search || statusFilter) && (
              <button
                type="button"
                className="btn btn-subtle btn-sm"
                onClick={() => {
                  setSearch('');
                  setStatusFilter('');
                  setCurrentPage(1);
                }}
                style={{ color: 'var(--danger)', fontWeight: 600 }}
              >
                Clear Filters
              </button>
            )}
          </div>
          <div className="table-toolbar-right">
            <Button variant="subtle" size="sm" onClick={loadData} title="Refresh Table">
              ↻ Refresh
            </Button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <Loading text="Loading maintenance records..." />
        ) : filteredRecords.length === 0 ? (
          <EmptyState
            title="No service records found"
            description={
              search || statusFilter
                ? 'No maintenance records match your search criteria or status filter.'
                : 'No equipment is currently logged for maintenance or repairs.'
            }
            actionText={search || statusFilter ? 'Clear Filters' : 'Create First Ticket'}
            onAction={
              search || statusFilter
                ? () => {
                    setSearch('');
                    setStatusFilter('');
                  }
                : () => setFormOpen(true)
            }
            icon="🛠️"
          />
        ) : (
          <>
            <ServiceTable
              records={paginatedRecords}
              assetMap={assetMap}
              onView={(rec) => setDetailsRecord(rec)}
              onEdit={(rec) => {
                setEditingRecord(rec);
                setFormOpen(true);
              }}
              onComplete={handleCompleteRecord}
            />
            <Pagination
              currentPage={currentPage}
              totalItems={totalItems}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
              itemLabel="service tickets"
            />
          </>
        )}
      </div>

      {/* Service Form Modal */}
      <ServiceForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingRecord(null);
        }}
        onSubmit={handleFormSubmit}
        assets={assets}
        initialData={editingRecord}
        loading={actionLoading}
      />

      {/* Service Details Modal */}
      <ServiceDetails
        record={detailsRecord}
        asset={detailsRecord ? assetMap.get(detailsRecord.asset_id) : null}
        isOpen={!!detailsRecord}
        onClose={() => setDetailsRecord(null)}
        onComplete={handleCompleteRecord}
      />
    </div>
  );
}
