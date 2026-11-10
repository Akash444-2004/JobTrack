import { AlertTriangle, X } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="jt-modal-backdrop" role="dialog" aria-modal="true">
      <div className="jt-modal-dialog p-4" style={{ maxWidth: '430px' }}>
        <div className="d-flex align-items-start justify-content-between mb-3">
          <div className="d-flex align-items-center gap-3">
            <div
              className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
              style={{
                width: '42px',
                height: '42px',
                backgroundColor: variant === 'danger' ? '#fef2f2' : '#eef2ff',
                color: variant === 'danger' ? '#dc2626' : '#4f46e5',
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <h5 className="mb-0 fw-bold">{title}</h5>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-light border-0 p-1"
            onClick={onCancel}
            disabled={loading}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-muted mb-4" style={{ fontSize: '0.94rem', lineHeight: 1.55 }}>
          {message}
        </p>

        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-light border px-3"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`btn btn-${variant} px-3`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
