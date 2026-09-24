import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon = null,
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) {
  const variantClass = `btn-${variant}`;
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${sizeClass} ${className}`.trim()}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <span
          className="spinner"
          style={{ width: '14px', height: '14px', borderWidth: '2px' }}
        />
      )}
      {!loading && icon && <span className="btn-icon">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
