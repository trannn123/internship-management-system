interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

function PageHeader({
  title,
  subtitle,
  actions,
}: PageHeaderProps) {
  return (
    <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
      <div>
        <h1 className="h3 mb-1">{title}</h1>
        {subtitle ? (
          <p className="text-secondary mb-0">{subtitle}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="d-flex flex-wrap gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

export default PageHeader;
