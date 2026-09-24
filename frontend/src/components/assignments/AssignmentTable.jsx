import React from 'react';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';
import { formatDate } from '../../utils/formatters';

export default function AssignmentTable({
  assignments = [],
  assetMap = new Map(),
  employeeMap = new Map(),
  onReturnClick,
  onRequestReturnClick,
}) {
  return (
    <div className="table-responsive">
      <table className="data-table" aria-label="Assignments Table">
        <thead>
          <tr>
            <th>Asset</th>
            <th>Custodian (Employee)</th>
            <th>Checkout Date</th>
            <th>Check-in Date</th>
            <th>Condition at Checkout</th>
            <th>Condition at Return</th>
            <th>Status</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((item) => {
            const asset = assetMap.get(item.asset_id);
            const employee = employeeMap.get(item.employee_id);
            const isReturned = !!item.returned_at;
            const assetStatus = asset?.status || (isReturned ? 'Available' : 'Assigned');
            const isReturnRequested = assetStatus.toLowerCase() === 'return requested';

            return (
              <tr key={item.id}>
                <td>
                  <span className="cell-code">{asset?.asset_tag || `ID: ${item.asset_id}`}</span>
                  <span className="cell-title" style={{ display: 'block', fontSize: '0.825rem' }}>
                    {asset?.name || asset?.asset_type || '—'}
                  </span>
                </td>
                <td>
                  <span className="cell-title">{employee?.name || `Employee #${item.employee_id}`}</span>
                  <span className="cell-subtext">{employee?.employee_code} • {employee?.department || '—'}</span>
                </td>
                <td>{formatDate(item.assigned_at)}</td>
                <td>{formatDate(item.returned_at)}</td>
                <td>{item.condition_at_assignment || 'Good'}</td>
                <td>{item.condition_at_return || '—'}</td>
                <td>
                  <StatusBadge status={isReturned ? 'Available' : assetStatus} />
                </td>
                <td style={{ textAlign: 'right' }}>
                  {!isReturned ? (
                    <div className="cell-actions" style={{ justifyContent: 'flex-end' }}>
                      {isReturnRequested ? (
                        <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
                          Return Pending
                        </span>
                      ) : (
                        onRequestReturnClick && (
                          <Button
                            variant="subtle"
                            size="sm"
                            onClick={() => onRequestReturnClick(item)}
                            title="Request Asset Return (Staff Request)"
                          >
                            Request Return
                          </Button>
                        )
                      )}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => onReturnClick(item)}
                        title="Direct Return to Inventory"
                      >
                        Check-in
                      </Button>
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Returned
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
