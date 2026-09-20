interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: string;
  action?: React.ReactNode;
}

function EmptyState({
  title,
  description = "Không có dữ liệu để hiển thị.",
  icon = "bi-inbox",
  action,
}: EmptyStateProps) {
  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body py-5 text-center text-secondary">
        <i className={`bi ${icon} fs-1 d-block mb-3 text-primary`} />
        <h3 className="h5 text-dark mb-2">{title}</h3>
        <p className="mb-0">{description}</p>
        {action ? <div className="mt-4">{action}</div> : null}
      </div>
    </div>
  );
}

export default EmptyState;
