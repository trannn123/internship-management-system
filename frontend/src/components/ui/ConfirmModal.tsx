interface ConfirmModalProps {
  show: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?:
    | "primary"
    | "danger"
    | "success"
    | "warning"
    | "secondary";
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmModal({
  show,
  title,
  message,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  confirmVariant = "primary",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!show) {
    return null;
  }

  return (
    <>
      <div
        className="modal fade show d-block"
        role="dialog"
        aria-modal="true"
        tabIndex={-1}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow">
            <div className="modal-header">
              <h2 className="modal-title fs-5 mb-0">{title}</h2>
              <button
                type="button"
                className="btn-close"
                aria-label="Đóng"
                onClick={onCancel}
                disabled={busy}
              />
            </div>
            <div className="modal-body">
              <p className="mb-0">{message}</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={onCancel}
                disabled={busy}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                className={`btn btn-${confirmVariant}`}
                onClick={onConfirm}
                disabled={busy}
              >
                {busy ? "Đang xử lý..." : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  );
}

export default ConfirmModal;
