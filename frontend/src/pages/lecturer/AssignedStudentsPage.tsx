import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getMyInternships } from "../../api/internship-api";
import { getInternshipRegistrations } from "../../api/internship-registration-api";
import DataTable, {
  type DataTableColumn,
} from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import type { Internship, InternshipRegistration } from "../../types";
import {
  getCompanyDisplayName,
  getDisplayName,
  getErrorMessage,
  loadRegistrationMetadata,
} from "./lecturer-helpers";

interface AssignedStudentRow {
  registration: InternshipRegistration;
  internship: Internship | null;
  studentName: string;
  companyName: string;
  position: string;
  periodName: string;
}

function AssignedStudentsPage() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<AssignedStudentRow[]>([]);

  useEffect(() => {
    async function loadAssignedStudents() {
      try {
        const [registrations, internships] = await Promise.all([
          getInternshipRegistrations(),
          getMyInternships(),
        ]);

        const assignedRegistrations = registrations.filter(
          (registration) =>
            registration.status === "IN_PROGRESS" ||
            registration.status === "COMPLETED_COMPANY" ||
            registration.status === "COMPLETED",
        );

        const metadata = await loadRegistrationMetadata(assignedRegistrations);
        const internshipByRegistrationId = new Map<number, Internship>(
          internships
            .filter((internship) => internship.registrationId != null)
            .map((internship) => [internship.registrationId as number, internship]),
        );

        setRows(
          assignedRegistrations.map((registration) => ({
            registration,
            internship: internshipByRegistrationId.get(registration.id) ?? null,
            studentName: getDisplayName(
              metadata.studentMap.get(registration.studentId),
              `Sinh viên #${registration.studentId}`,
            ),
            companyName: getCompanyDisplayName(
              metadata.companyMap.get(registration.companyId),
              `Doanh nghiệp #${registration.companyId}`,
            ),
            position:
              internshipByRegistrationId.get(registration.id)?.position ??
              metadata.opportunityMap.get(registration.opportunityId)?.position ??
              "—",
            periodName:
              metadata.periodMap.get(registration.periodId)?.name ??
              `Đợt #${registration.periodId}`,
          })),
        );
      } catch (loadError) {
        console.error("Failed to load lecturer assigned students:", loadError);
        setError(
          getErrorMessage(
            loadError,
            "Không thể tải danh sách sinh viên được phân công.",
          ),
        );
      } finally {
        setLoading(false);
      }
    }

    loadAssignedStudents();
  }, []);

  const selectedPeriodId = Number(searchParams.get("periodId"));
  const hasPeriodFilter = Number.isFinite(selectedPeriodId) && selectedPeriodId > 0;

  const filteredRows = useMemo(() => {
    if (!hasPeriodFilter) {
      return rows;
    }

    return rows.filter((row) => row.registration.periodId === selectedPeriodId);
  }, [hasPeriodFilter, rows, selectedPeriodId]);

  const columns: DataTableColumn<AssignedStudentRow>[] = [
    {
      key: "studentName",
      header: "Sinh viên",
      render: (row) => (
        <div>
          <div className="fw-semibold">{row.studentName}</div>
          <small className="text-secondary">{row.periodName}</small>
        </div>
      ),
    },
    {
      key: "companyName",
      header: "Doanh nghiệp",
    },
    {
      key: "position",
      header: "Vị trí",
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (row) => <StatusBadge status={row.registration.status} />,
    },
    {
      key: "action",
      header: "",
      className: "text-end",
      render: (row) => (
        <Link
          to={`/lecturer/students/${row.internship?.id ?? row.registration.id}`}
          className="btn btn-sm btn-outline-primary"
        >
          <i className="bi bi-graph-up-arrow me-1" />
          Xem tiến độ
        </Link>
      ),
    },
  ];

  if (loading) {
    return <LoadingState message="Đang tải sinh viên được phân công..." />;
  }

  return (
    <div className="d-flex flex-column gap-4">
      <PageHeader
        title="Sinh viên được phân công"
        subtitle={
          hasPeriodFilter
            ? `Đang lọc theo đợt #${selectedPeriodId}.`
            : "Theo dõi tiến độ các sinh viên đang và đã thực tập dưới sự hướng dẫn của bạn."
        }
        actions={
          hasPeriodFilter ? (
            <Link to="/lecturer/students" className="btn btn-outline-secondary">
              <i className="bi bi-x-circle me-2" />
              Bỏ lọc
            </Link>
          ) : (
            <Link to="/lecturer/periods" className="btn btn-outline-primary">
              <i className="bi bi-calendar-range me-2" />
              Xem đợt được phân công
            </Link>
          )
        }
      />

      {error ? (
        <div className="alert alert-danger shadow-sm border-0 rounded-3 mb-0">
          <i className="bi bi-exclamation-triangle me-2" />
          {error}
        </div>
      ) : null}

      {filteredRows.length === 0 ? (
        <EmptyState
          title="Chưa có sinh viên phù hợp"
          description={
            hasPeriodFilter
              ? "Không có sinh viên nào thuộc đợt đang lọc."
              : "Khi có sinh viên được duyệt và bắt đầu thực tập, danh sách sẽ hiển thị tại đây."
          }
          icon="bi-mortarboard"
        />
      ) : (
        <DataTable
          columns={columns}
          rows={filteredRows}
          rowKey={(row) => row.registration.id}
          emptyTitle="Chưa có sinh viên"
          emptyDescription="Danh sách sinh viên được phân công hiện đang trống."
        />
      )}
    </div>
  );
}

export default AssignedStudentsPage;
