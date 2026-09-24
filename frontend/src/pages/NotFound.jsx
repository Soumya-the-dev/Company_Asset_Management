import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '65vh',
        textAlign: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div
        style={{
          fontSize: '4.5rem',
          fontWeight: 800,
          color: 'var(--primary)',
          lineHeight: 1,
          marginBottom: '0.5rem',
          letterSpacing: '-0.03em',
        }}
      >
        404
      </div>
      <h1
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: '0 0 0.5rem 0',
        }}
      >
        Page Not Found
      </h1>
      <p
        style={{
          maxWidth: '440px',
          color: 'var(--text-secondary)',
          fontSize: '0.925rem',
          lineHeight: 1.5,
          margin: '0 0 1.5rem 0',
        }}
      >
        The page or asset record you requested does not exist or may have been relocated.
        Please check the URL or use the navigation below.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Button variant="primary" onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </Button>
        <Button variant="secondary" onClick={() => navigate('/assets')}>
          View Asset Catalog
        </Button>
      </div>
    </div>
  );
}