const STATUS_VARIANTS: Record<string, string> = {
  PENDING_COMPANY: "bg-warning text-dark",
  PENDING_LECTURER: "bg-info text-dark",
  IN_PROGRESS: "bg-primary",
  COMPLETED: "bg-success",
  COMPLETED_COMPANY: "bg-success",
  COMPLETED_LECTURER: "bg-success",
  OPEN: "bg-success",
  CLOSED: "bg-secondary",
  DRAFT: "bg-secondary",
  TODO: "bg-secondary",
};

// Vietnamese labels for every known status value. The lecturer's approval is
// the final sign-off step, so once an internship reaches COMPLETED_LECTURER
// every role should simply see "Hoàn thành".
const STATUS_LABEL_OVERRIDES: Record<string, string> = {
  PENDING_COMPANY: "Chờ doanh nghiệp duyệt",
  REJECTED_COMPANY: "Doanh nghiệp từ chối",
  PENDING_LECTURER: "Chờ giảng viên duyệt",
  REJECTED_LECTURER: "Giảng viên từ chối",
  IN_PROGRESS: "Đang thực tập",
  COMPLETED_COMPANY: "Doanh nghiệp đã đánh giá",
  COMPLETED_LECTURER: "Hoàn thành",
  COMPLETED: "Hoàn thành",
  OPEN: "Đang mở",
  CLOSED: "Đã đóng",
  DRAFT: "Nháp",
  TODO: "Cần làm",
  UNKNOWN: "Không xác định",
};

function toLabel(status: string) {
  return STATUS_LABEL_OVERRIDES[status] ?? status.replaceAll("_", " ");
}

interface StatusBadgeProps {
  status: string | null | undefined;
  label?: string;
}

function StatusBadge({ status, label }: StatusBadgeProps) {
  const normalizedStatus = status ?? "UNKNOWN";
  const variant = normalizedStatus.startsWith("REJECTED")
    ? "bg-danger"
    : STATUS_VARIANTS[normalizedStatus] ?? "bg-light text-dark";

  return (
    <span className={`badge ${variant}`}>
      {label ?? toLabel(normalizedStatus)}
    </span>
  );
}

export default StatusBadge;
