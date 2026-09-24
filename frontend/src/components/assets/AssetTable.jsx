import React from 'react';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import { formatDate } from '../../utils/formatters';

export default function AssetTable({
  assets = [],
  custodianMap = new Map(),
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="table-responsive">
      <table className="data-table" aria-label="Assets Table">
        <thead>
          <tr>
            <th>Asset Tag</th>
            <th>Type & Name</th>
            <th>Serial Number / Key</th>
            <th>Model / Quota</th>
            <th>Current Custodian</th>
            <th>Department</th>
            <th>Purchase Date</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => {
            const custodian = custodianMap.get(asset.id);
            const isSoftware = asset.asset_type === 'Software License';

            return (
              <tr key={asset.id}>
                <td>
                  <span className="cell-code">{asset.asset_tag}</span>
                </td>
                <td>
                  <span className="cell-title">{asset.name || asset.asset_type}</span>
                  <span className="cell-subtext">
                    {isSoftware ? '🔑 Software License' : asset.asset_type} {asset.category ? `• ${asset.category}` : ''}
                  </span>
                </td>
                <td>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    {isSoftware && (asset.license_key || asset.serial_number) ? `🔑 ${asset.license_key || asset.serial_number}` : (asset.serial_number || '—')}
                  </span>
                </td>
                <td>
                  <div>
                    {isSoftware
                      ? asset.seat_quota
                        ? `${asset.seat_quota} Seats Quota`
                        : asset.model || 'Seat Subscription'
                      : asset.model || '—'}
                  </div>
                  <span className="cell-subtext">{asset.manufacturer || ''}</span>
                </td>
                <td>
                  {custodian ? (
                    <div>
                      <span className="cell-title">{custodian.name}</span>
                      <span className="cell-subtext">{custodian.employee_code}</span>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>— Unassigned —</span>
                  )}
                </td>
                <td>{custodian?.department || '—'}</td>
                <td>{formatDate(asset.purchase_date)}</td>
                <td>
                  <StatusBadge status={asset.status} />
                </td>
                <td>
                  <div className="cell-actions">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onView(asset)}
                      title="View Asset Details"
                    >
                      View
                    </Button>
                    <Button
                      variant="subtle"
                      size="sm"
                      onClick={() => onEdit(asset)}
                      title="Edit Asset"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="subtle"
                      size="sm"
                      onClick={() => onDelete(asset)}
                      title="Delete Asset"
                      style={{ color: 'var(--danger)' }}
                    >
                      Delete
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
