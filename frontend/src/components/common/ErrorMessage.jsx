import React from 'react';
import Button from './Button';

export default function ErrorMessage({
  message = 'An unexpected error occurred.',
  onRetry = null,
}) {
  return (
    <div className="error-alert" role="alert">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <span style={{ fontWeight: 'bold' }}>⚠️</span>
        <span>{message}</span>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
