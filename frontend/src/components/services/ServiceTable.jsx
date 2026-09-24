import React from 'react';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import { formatDate, formatCurrency } from '../../utils/formatters';

export default function ServiceTable({
  records = [],
  assetMap = new Map(),
  onView,
  onEdit,
  onComplete,
}) {
  return (
    <div className="table-responsive">
      <table className="data-table" aria-label="Maintenance Records Table">
        <thead>
          <tr>
            <th>Asset</th>
            <th>Service Type</th>
            <th>Issue Summary</th>
            <th>Vendor / Provider</th>
            <th>Cost</th>
            <th>Service Date</th>
            <th>Completed Date</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((rec) => {
            const asset = assetMap.get(rec.asset_id);
            const isOpen = rec.status.toUpperCase() === 'OPEN' || rec.status.toUpperCase() === 'IN_PROGRESS';

            return (
              <tr key={rec.id}>
                <td>
                  <span className="cell-code">{asset?.asset_tag || `ID: ${rec.asset_id}`}</span>
                  <span className="cell-title" style={{ display: 'block', fontSize: '0.825rem' }}>
                    {asset?.name || asset?.asset_type || '—'}
                  </span>
                </td>
                <td>
                  <span className="cell-title">{rec.service_type}</span>
                </td>
                <td>
                  <span style={{ maxWidth: '220px', display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={rec.description}>
                    {rec.description}
                  </span>
                </td>
                <td>{rec.service_provider || 'Internal IT'}</td>
                <td>{formatCurrency(rec.cost)}</td>
                <td>{formatDate(rec.service_date)}</td>
                <td>{formatDate(rec.completed_date)}</td>
                <td>
                  <StatusBadge status={rec.status} />
                </td>
                <td>
                  <div className="cell-actions">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onView(rec)}
                      title="View Maintenance Details"
                    >
                      View
                    </Button>
                    {isOpen && (
                      <Button
                        variant="subtle"
                        size="sm"
                        style={{ color: 'var(--success)' }}
                        onClick={() => onComplete(rec)}
                        title="Mark Completed"
                      >
                        Resolve
                      </Button>
                    )}
                    <Button
                      variant="subtle"
                      size="sm"
                      onClick={() => onEdit(rec)}
                      title="Edit Record"
                    >
                      Edit
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
