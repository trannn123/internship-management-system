interface StatCardProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon?: string;
  variant?:
    | "primary"
    | "success"
    | "warning"
    | "info"
    | "danger"
    | "secondary";
}

function StatCard({
  title,
  value,
  subtitle,
  icon = "bi-bar-chart",
  variant = "primary",
}: StatCardProps) {
  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start gap-3">
          <div>
            <p className="text-secondary text-uppercase small fw-semibold mb-2">
              {title}
            </p>
            <h2 className="h3 mb-1">{value}</h2>
            {subtitle ? (
              <p className="text-secondary mb-0">{subtitle}</p>
            ) : null}
          </div>
          <span className={`icon-circle bg-${variant}-subtle text-${variant}`}>
            <i className={`bi ${icon} fs-5`} />
          </span>
        </div>
      </div>
    </div>
  );
}

export default StatCard;
