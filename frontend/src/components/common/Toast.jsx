import React from 'react';
import { useToast } from '../../context/ToastContext';

export default function Toast() {
  const { toasts, removeToast } = useToast();

  if (!toasts.length) return null;

  return (
    <div className="toast-container" aria-live="assertive">
      {toasts.map((toast) => {
        const typeClass =
          toast.type === 'error'
            ? 'toast-error'
            : toast.type === 'info'
            ? 'toast-info'
            : 'toast-success';

        const icon =
          toast.type === 'error' ? '❌' : toast.type === 'info' ? 'ℹ️' : '✅';

        return (
          <div key={toast.id} className={`toast ${typeClass}`}>
            <span aria-hidden="true">{icon}</span>
            <div className="toast-message">{toast.message}</div>
            <button
              type="button"
              className="toast-close"
              onClick={() => removeToast(toast.id)}
              aria-label="Close notification"
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
