import React from 'react';
import { STATUS_CONFIG } from '../../utils/constants';

export default function StatusBadge({ status }) {
  if (!status) return <span>—</span>;

  const config = STATUS_CONFIG[status] || {
    label: status,
    color: '#475569',
    bg: '#f1f5f9',
    border: '#cbd5e1',
    dot: '#64748b',
  };

  return (
    <span
      className="status-badge"
      style={{
        backgroundColor: config.bg,
        color: config.color,
        borderColor: config.border,
      }}
      title={`Status: ${config.label}`}
    >
      <span
        className="status-badge-dot"
        style={{ backgroundColor: config.dot }}
        aria-hidden="true"
      />
      <span>{config.label}</span>
    </span>
  );
}
