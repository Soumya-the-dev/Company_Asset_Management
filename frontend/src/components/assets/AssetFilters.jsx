import React from 'react';
import { ASSET_TYPES, ASSET_STATUSES, ASSET_CATEGORIES } from '../../utils/constants';

export default function AssetFilters({
  filters = {},
  onFilterChange,
  onClear,
}) {
  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '130px', padding: '0.4rem 0.65rem', fontSize: '0.8125rem' }}
          value={filters.status || ''}
          onChange={(e) => onFilterChange('status', e.target.value)}
          aria-label="Filter by Status"
        >
          <option value="">All Statuses</option>
          {ASSET_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>

        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '130px', padding: '0.4rem 0.65rem', fontSize: '0.8125rem' }}
          value={filters.asset_type || ''}
          onChange={(e) => onFilterChange('asset_type', e.target.value)}
          aria-label="Filter by Asset Type"
        >
          <option value="">All Types</option>
          {ASSET_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <select
          className="form-select"
          style={{ width: 'auto', minWidth: '140px', padding: '0.4rem 0.65rem', fontSize: '0.8125rem' }}
          value={filters.category || ''}
          onChange={(e) => onFilterChange('category', e.target.value)}
          aria-label="Filter by Category"
        >
          <option value="">All Categories</option>
          {ASSET_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            className="btn btn-subtle btn-sm"
            onClick={onClear}
            style={{ color: 'var(--danger)', fontWeight: 600 }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="active-filters-bar" style={{ marginTop: '0.65rem', borderRadius: 'var(--radius-sm)' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Active Filters:</span>
          {filters.status && (
            <span className="filter-chip">
              Status: <strong>{filters.status}</strong>
              <button
                type="button"
                className="filter-chip-remove"
                onClick={() => onFilterChange('status', '')}
                title="Remove filter"
              >
                ✕
              </button>
            </span>
          )}
          {filters.asset_type && (
            <span className="filter-chip">
              Type: <strong>{filters.asset_type}</strong>
              <button
                type="button"
                className="filter-chip-remove"
                onClick={() => onFilterChange('asset_type', '')}
                title="Remove filter"
              >
                ✕
              </button>
            </span>
          )}
          {filters.category && (
            <span className="filter-chip">
              Category: <strong>{filters.category}</strong>
              <button
                type="button"
                className="filter-chip-remove"
                onClick={() => onFilterChange('category', '')}
                title="Remove filter"
              >
                ✕
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
