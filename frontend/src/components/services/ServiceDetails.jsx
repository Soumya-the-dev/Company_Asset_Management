import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import StatusBadge from '../common/StatusBadge';
import { formatDate, formatCurrency } from '../../utils/formatters';

export default function ServiceDetails({
  record,
  asset,
  isOpen,
  onClose,
  onComplete,
}) {
  if (!record) return null;

  const isOpenStatus = record.status.toUpperCase() === 'OPEN' || record.status.toUpperCase() === 'IN_PROGRESS';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Maintenance Ticket #${record.id}: ${record.service_type}`}
      size="md"
      footer={
        <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {isOpenStatus && onComplete && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  onComplete(record);
                }}
              >
                Mark as Completed
              </Button>
            )}
          </div>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <span className="cell-code">{asset?.asset_tag || `Asset #${record.asset_id}`}</span>
          <span className="cell-title" style={{ display: 'block', marginTop: '0.25rem' }}>
            {asset?.name || asset?.asset_type || '—'}
          </span>
        </div>
        <StatusBadge status={record.status} />
      </div>

      <div className="detail-grid">
        <div className="detail-item">
          <span className="detail-label">Service Type</span>
          <span className="detail-value">{record.service_type}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Service Provider</span>
          <span className="detail-value">{record.service_provider || 'In-House'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Service Date</span>
          <span className="detail-value">{formatDate(record.service_date)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Completion Date</span>
          <span className="detail-value">{formatDate(record.completed_date)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Repair Cost</span>
          <span className="detail-value">{formatCurrency(record.cost)}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Current Asset Status</span>
          <span className="detail-value">
            <StatusBadge status={asset?.status || 'In Repair'} />
          </span>
        </div>
      </div>

      <hr className="section-divider" />

      <div style={{ marginBottom: '1rem' }}>
        <span className="detail-label">Issue Summary</span>
        <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {record.description || 'No description provided.'}
        </p>
      </div>

      <div>
        <span className="detail-label">Resolution Notes</span>
        <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {record.notes || 'No resolution notes recorded yet.'}
        </p>
      </div>
    </Modal>
  );
}
