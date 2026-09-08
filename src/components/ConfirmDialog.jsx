import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import './ConfirmDialog.css';

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Yes, continue',
  cancelLabel = 'Cancel',
  danger = true,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onCancel?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="confirm-dialog-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel?.();
      }}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="confirm-dialog-panel">
        <span className={`confirm-dialog-icon ${danger ? 'danger' : ''}`}>
          <AlertTriangle size={20} />
        </span>
        <h3 id="confirm-dialog-title" className="confirm-dialog-title">
          {title}
        </h3>
        {message && <p className="confirm-dialog-message">{message}</p>}
        <div className="confirm-dialog-actions">
          <button className="btn btn-outline confirm-dialog-cancel" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button
            className={`btn confirm-dialog-confirm ${danger ? 'danger' : ''}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
