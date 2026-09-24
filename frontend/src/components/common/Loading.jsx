import React from 'react';

export default function Loading({ text = 'Loading records...' }) {
  return (
    <div className="loading-container" role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true" />
      <span>{text}</span>
    </div>
  );
}
