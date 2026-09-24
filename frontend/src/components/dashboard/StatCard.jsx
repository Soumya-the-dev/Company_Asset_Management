import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = '#2563eb',
  bg = '#eff6ff',
  onClick = null,
}) {
  return (
    <div
      className={`stat-card ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          onClick();
        }
      }}
    >
      <div className="stat-card-header">
        <span className="stat-card-title">{title}</span>
        <div className="stat-card-icon" style={{ backgroundColor: bg, color }}>
          {icon}
        </div>
      </div>
      <div className="stat-card-value">{value !== undefined && value !== null ? value : '—'}</div>
      {subtitle && <div className="stat-card-subtitle">{subtitle}</div>}
    </div>
  );
}
