interface LoadingStateProps {
  message?: string;
}

function LoadingState({
  message = "Đang tải dữ liệu...",
}: LoadingStateProps) {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5 gap-3 text-secondary">
      <div
        className="spinner-border text-primary"
        role="status"
        aria-hidden="true"
      />
      <p className="mb-0">{message}</p>
    </div>
  );
}

export default LoadingState;
