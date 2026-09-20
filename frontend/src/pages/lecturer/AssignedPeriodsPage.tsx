import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAssignedInternshipPeriodsForLecturer } from "../../api/internship-period-api";
import { getInternshipRegistrations } from "../../api/internship-registration-api";
import { getCurrentUser } from "../../api/user-api";
import DataTable, {
  type DataTableColumn,
} from "../../components/ui/DataTable";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import type { InternshipPeriod, LecturerProfile } from "../../types";
import { formatDateRange, getErrorMessage } from "./lecturer-helpers";

interface AssignedPeriodRow {
  period: InternshipPeriod;
  assignedStudents: number;
}

function AssignedPeriodsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<AssignedPeriodRow[]>([]);

  useEffect(() => {
    async function loadAssignedPeriods() {
      try {
        const currentUser = await getCurrentUser();
        const lecturerProfileId =
          (currentUser.profile as LecturerProfile | null)?.id ??
          currentUser.id;
        const [periods, registrations] = await Promise.all([
          getAssignedInternshipPeriodsForLecturer(lecturerProfileId),
          getInternshipRegistrations(),
        ]);

        setRows(
          periods.map((period) => ({
            period,
            assignedStudents: registrations.filter(
              (registration) =>
                registration.periodId === period.id &&
                (registration.status === "IN_PROGRESS" ||
                  registration.status === "COMPLETED_COMPANY" ||
                  registration.status === "COMPLETED"),
            ).length,
          })),
        );
      } catch (loadError) {
        console.error("Failed to load assigned periods:", loadError);
        setError(
          getErrorMessage(loadError, "Không thể tải danh sách đợt được phân công."),
        );
      } finally {
        setLoading(false);
      }
    }

    loadAssignedPeriods();
  }, []);

  const columns: DataTableColumn<AssignedPeriodRow>[] = [
    {
      key: "name",
      header: "Đợt thực tập",
      render: (row) => (
        <div>
          <div className="fw-semibold">{row.period.name}</div>
          <small className="text-secondary">
            {row.period.description ?? "Không có mô tả"}
          </small>
        </div>
      ),
    },
    {
      key: "dates",
      header: "Thời gian",
      render: (row) => (
        <div>
          <div>{formatDateRange(row.period.internshipStartDate, row.period.internshipEndDate)}</div>
          <small className="text-secondary">
            Đăng ký:{" "}
            {formatDateRange(
              row.period.registrationStartDate,
              row.period.registrationEndDate,
            )}
          </small>
        </div>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (row) => <StatusBadge status={row.period.status} />,
    },
    {
      key: "assignedStudents",
      header: "Sinh viên phụ trách",
      render: (row) => (
        <span className="badge text-bg-light border">{row.assignedStudents}</span>
      ),
    },
    {
      key: "action",
      header: "",
      className: "text-end",
      render: (row) => (
        <Link
          to={`/lecturer/students?periodId=${row.period.id}`}
          className="btn btn-sm btn-outline-primary"
        >
          <i className="bi bi-people me-1" />
          Xem sinh viên
        </Link>
      ),
    },
  ];

  if (loading) {
    return <LoadingState message="Đang tải các đợt được phân công..." />;
  }

  return (
    <div className="d-flex flex-column gap-4">
      <PageHeader
        title="Đợt thực tập được phân công"
        subtitle="Danh sách các đợt mà bạn đang phụ trách theo phân công của nhà trường."
      />

      {error ? (
        <div className="alert alert-danger shadow-sm border-0 rounded-3 mb-0">
          <i className="bi bi-exclamation-triangle me-2" />
          {error}
        </div>
      ) : null}

      <DataTable
        columns={columns}
        rows={rows}
        rowKey={(row) => row.period.id}
        emptyTitle="Chưa có đợt nào được phân công"
        emptyDescription="Khi có phân công mới, danh sách đợt thực tập sẽ xuất hiện tại đây."
      />
    </div>
  );
}

export default AssignedPeriodsPage;
