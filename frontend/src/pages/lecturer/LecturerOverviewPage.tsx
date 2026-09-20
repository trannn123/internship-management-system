import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyInternships } from "../../api/internship-api";
import { getAssignedInternshipPeriodsForLecturer } from "../../api/internship-period-api";
import { getInternshipRegistrations } from "../../api/internship-registration-api";
import { getCurrentUser } from "../../api/user-api";
import DataTable, {
  type DataTableColumn,
} from "../../components/ui/DataTable";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import StatusBadge from "../../components/ui/StatusBadge";
import type { InternshipRegistration, LecturerProfile } from "../../types";
import {
  formatDateTime,
  getCompanyDisplayName,
  getDisplayName,
  getErrorMessage,
  loadRegistrationMetadata,
} from "./lecturer-helpers";

interface PendingRegistrationRow {
  registration: InternshipRegistration;
  studentName: string;
  companyName: string;
  position: string;
  periodName: string;
}

function LecturerOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    assignedPeriods: 0,
    pendingRegistrations: 0,
    activeStudents: 0,
    completedStudents: 0,
  });
  const [pendingRows, setPendingRows] = useState<PendingRegistrationRow[]>([]);

  useEffect(() => {
    async function loadOverview() {
      try {
        const currentUser = await getCurrentUser();
        const lecturerProfileId =
          (currentUser.profile as LecturerProfile | null)?.id ??
          currentUser.id;
        const [assignedPeriods, registrations, internships] = await Promise.all([
          getAssignedInternshipPeriodsForLecturer(lecturerProfileId),
          getInternshipRegistrations(),
          getMyInternships(),
        ]);

        const pendingRegistrations = registrations
          .filter(
            (registration) =>
              registration.status === "PENDING_LECTURER",
          )
          .sort((left, right) => {
            const leftTime = new Date(left.registeredAt ?? 0).getTime();
            const rightTime = new Date(right.registeredAt ?? 0).getTime();

            return rightTime - leftTime;
          });

        const metadata = await loadRegistrationMetadata(
          pendingRegistrations.slice(0, 5),
        );

        setStats({
          assignedPeriods: assignedPeriods.length,
          pendingRegistrations: pendingRegistrations.length,
          activeStudents: internships.filter(
            (internship) =>
              internship.status === "IN_PROGRESS" ||
              internship.status === "COMPLETED_COMPANY",
          ).length,
          completedStudents: registrations.filter(
            (registration) => registration.status === "COMPLETED",
          ).length,
        });

        setPendingRows(
          pendingRegistrations.slice(0, 5).map((registration) => ({
            registration,
            studentName: getDisplayName(
              metadata.studentMap.get(registration.studentId),
              `Sinh viên #${registration.studentId}`,
            ),
            companyName: getCompanyDisplayName(
              metadata.companyMap.get(registration.companyId),
              `Doanh nghiệp #${registration.companyId}`,
            ),
            position:
              metadata.opportunityMap.get(registration.opportunityId)?.position ?? "—",
            periodName:
              metadata.periodMap.get(registration.periodId)?.name ??
              `Đợt #${registration.periodId}`,
          })),
        );
      } catch (loadError) {
        console.error("Failed to load lecturer overview:", loadError);
        setError(
          getErrorMessage(loadError, "Không thể tải tổng quan giảng viên."),
        );
      } finally {
        setLoading(false);
      }
    }

    loadOverview();
  }, []);

  const columns: DataTableColumn<PendingRegistrationRow>[] = [
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
      key: "registeredAt",
      header: "Ngày đăng ký",
      render: (row) => formatDateTime(row.registration.registeredAt),
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
          to="/lecturer/registrations/pending"
          className="btn btn-sm btn-outline-primary"
          state={{ focusRegistrationId: row.registration.id }}
        >
          <i className="bi bi-arrow-right me-1" />
          Xem hàng chờ
        </Link>
      ),
    },
  ];

  if (loading) {
    return <LoadingState message="Đang tải tổng quan giảng viên..." />;
  }

  return (
    <div className="d-flex flex-column gap-4">
      <PageHeader
        title="Tổng quan giảng viên"
        subtitle="Theo dõi nhanh số lượng đợt phụ trách, hồ sơ chờ duyệt và tiến độ sinh viên."
        actions={
          <Link to="/lecturer/registrations/pending" className="btn btn-primary">
            <i className="bi bi-clipboard-check me-2" />
            Mở hàng chờ duyệt
          </Link>
        }
      />

      {error ? (
        <div className="alert alert-danger shadow-sm border-0 rounded-3 mb-0">
          <i className="bi bi-exclamation-triangle me-2" />
          {error}
        </div>
      ) : null}

      <div className="row g-3">
        <div className="col-12 col-md-6 col-xl-3">
          <StatCard
            title="Đợt được phân công"
            value={stats.assignedPeriods}
            subtitle="Số đợt thực tập đang phụ trách"
            icon="bi-calendar-range"
            variant="primary"
          />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <StatCard
            title="Hồ sơ chờ duyệt"
            value={stats.pendingRegistrations}
            subtitle="Cần giảng viên phản hồi"
            icon="bi-hourglass-split"
            variant="info"
          />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <StatCard
            title="Sinh viên đang thực tập"
            value={stats.activeStudents}
            subtitle="Đang theo dõi tiến độ"
            icon="bi-people"
            variant="warning"
          />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <StatCard
            title="Đã hoàn thành"
            value={stats.completedStudents}
            subtitle="Đã khép lại đầy đủ"
            icon="bi-check2-circle"
            variant="success"
          />
        </div>
      </div>

      <section className="card border-0 shadow-sm rounded-3">
        <div className="card-body">
          <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-3">
            <div>
              <h2 className="h5 mb-1">Hồ sơ chờ duyệt gần đây</h2>
              <p className="text-secondary mb-0">
                Ưu tiên xử lý sớm để sinh viên kịp bắt đầu thực tập.
              </p>
            </div>
            <Link
              to="/lecturer/registrations/pending"
              className="btn btn-outline-primary align-self-start"
            >
              <i className="bi bi-list-task me-2" />
              Xem toàn bộ
            </Link>
          </div>

          <DataTable
            columns={columns}
            rows={pendingRows}
            rowKey={(row) => row.registration.id}
            emptyTitle="Không có hồ sơ chờ duyệt"
            emptyDescription="Các đăng ký được phân công cho bạn đã được xử lý hết."
          />
        </div>
      </section>
    </div>
  );
}

export default LecturerOverviewPage;
