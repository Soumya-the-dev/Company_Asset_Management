import React from 'react';
import Button from '../common/Button';
import { getInitials } from '../../utils/formatters';

export default function EmployeeTable({
  employees = [],
  assignedCountMap = new Map(),
  onView,
  onEdit,
  onDelete,
}) {
  return (
    <div className="table-responsive">
      <table className="data-table" aria-label="Employees Table">
        <thead>
          <tr>
            <th>Employee ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Department</th>
            <th>Designation</th>
            <th>Assigned Assets</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => {
            const count = assignedCountMap.get(emp.id) || 0;

            return (
              <tr key={emp.id}>
                <td>
                  <span className="cell-code">{emp.employee_code}</span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: 'var(--bg-subtle)',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.725rem',
                        fontWeight: 'bold',
                        border: '1px solid var(--border-default)',
                      }}
                    >
                      {getInitials(emp.name)}
                    </div>
                    <span className="cell-title">{emp.name}</span>
                  </div>
                </td>
                <td>
                  <a href={`mailto:${emp.email}`} style={{ color: 'var(--text-secondary)' }}>
                    {emp.email}
                  </a>
                </td>
                <td>{emp.department || '—'}</td>
                <td>{emp.designation || '—'}</td>
                <td>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.15rem 0.6rem',
                      borderRadius: 'var(--radius-full)',
                      background: count > 0 ? 'var(--primary-subtle)' : 'var(--bg-subtle)',
                      color: count > 0 ? 'var(--primary)' : 'var(--text-muted)',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                    }}
                  >
                    {count} {count === 1 ? 'asset' : 'assets'}
                  </span>
                </td>
                <td>
                  <div className="cell-actions">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onView(emp)}
                      title="View Profile & Assigned Assets"
                    >
                      View
                    </Button>
                    <Button
                      variant="subtle"
                      size="sm"
                      onClick={() => onEdit(emp)}
                      title="Edit Employee"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="subtle"
                      size="sm"
                      style={{ color: 'var(--danger)' }}
                      onClick={() => onDelete(emp)}
                      title="Delete Employee"
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
