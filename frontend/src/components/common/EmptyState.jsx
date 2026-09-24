import React from 'react';
import Button from './Button';

export default function EmptyState({
  title = 'No records found',
  description = 'Try changing your search keywords or filter criteria.',
  actionText = null,
  onAction = null,
  icon = '📂',
}) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" aria-hidden="true">
        <span style={{ fontSize: '1.4rem' }}>{icon}</span>
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
