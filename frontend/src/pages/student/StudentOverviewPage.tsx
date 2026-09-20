import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getEvaluationSummary } from "../../api/evaluation-api";
import { getMyInternships } from "../../api/internship-api";
import { getInternshipOpportunities } from "../../api/internship-opportunity-api";
import { getInternshipPeriods } from "../../api/internship-period-api";
import { getInternshipRegistrations } from "../../api/internship-registration-api";
import { getCurrentUser } from "../../api/user-api";
import DataTable from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import StatusBadge from "../../components/ui/StatusBadge";
import { OpportunityStatus, RegistrationStatus } from "../../types";
import type {
  CurrentUser,
  EvaluationSummary,
  Internship,
  InternshipOpportunity,
  InternshipPeriod,
  InternshipRegistration,
  StudentProfile,
} from "../../types";

interface RecentRegistrationRow {
  id: number;
  opportunityLabel: string;
  periodLabel: string;
  status: InternshipRegistration["status"];
  registeredAt: string | null;
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatDateRange(
  start: string | null | undefined,
  end: string | null | undefined,
) {
  if (!start && !end) {
    return "Chưa cập nhật";
  }

  return `${formatDate(start)} - ${formatDate(end)}`;
}

function StudentOverviewPage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [opportunities, setOpportunities] = useState<InternshipOpportunity[]>([]);
  const [periods, setPeriods] = useState<InternshipPeriod[]>([]);
  const [registrations, setRegistrations] = useState<InternshipRegistration[]>([]);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [evaluationSummary, setEvaluationSummary] =
    useState<EvaluationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const [
          userData,
          opportunityData,
          periodData,
          registrationData,
          internshipData,
        ] = await Promise.all([
          getCurrentUser(),
          getInternshipOpportunities(),
          getInternshipPeriods(),
          getInternshipRegistrations(),
          getMyInternships(),
        ]);

        setUser(userData);
        setOpportunities(opportunityData);
        setPeriods(periodData);
        setRegistrations(registrationData);
        setInternships(internshipData);

        const latestCompletedInternship = [...internshipData]
          .filter(
            (internship) =>
              internship.status === "COMPLETED_COMPANY"
              || internship.status === "COMPLETED_LECTURER",
          )
          .sort(
            (left, right) =>
              new Date(right.endDate).getTime() - new Date(left.endDate).getTime(),
          )[0];

        if (latestCompletedInternship) {
          try {
            const summary = await getEvaluationSummary(latestCompletedInternship.id);
            setEvaluationSummary(summary);
          } catch (evaluationError) {
            console.error("Failed to load evaluation summary:", evaluationError);
            setEvaluationSummary(null);
          }
        } else {
          setEvaluationSummary(null);
        }
      } catch (loadError) {
        console.error("Failed to load student overview:", loadError);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Không thể tải tổng quan sinh viên.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  const profile = user?.profile as StudentProfile | null | undefined;

  const openPeriodIds = useMemo(
    () =>
      new Set(
        periods
          .filter((period) => period.status === "OPEN")
          .map((period) => period.id),
      ),
    [periods],
  );

  const openOpportunities = useMemo(
    () =>
      opportunities.filter(
        (opportunity) =>
          opportunity.status === OpportunityStatus.OPEN
          && openPeriodIds.has(opportunity.periodId),
      ),
    [opportunities, openPeriodIds],
  );

  const opportunityMap = useMemo(
    () =>
      new Map(opportunities.map((opportunity) => [opportunity.id, opportunity])),
    [opportunities],
  );

  const periodMap = useMemo(
    () => new Map(periods.map((period) => [period.id, period])),
    [periods],
  );

  const recentRegistrations = useMemo<RecentRegistrationRow[]>(
    () =>
      [...registrations]
        .sort(
          (left, right) =>
            new Date(right.registeredAt ?? 0).getTime()
            - new Date(left.registeredAt ?? 0).getTime(),
        )
        .slice(0, 5)
        .map((registration) => {
          const opportunity = opportunityMap.get(registration.opportunityId);
          const period = periodMap.get(registration.periodId);

          return {
            id: registration.id,
            opportunityLabel: opportunity?.position ?? `Cơ hội #${registration.opportunityId}`,
            periodLabel: period?.name ?? `Đợt #${registration.periodId}`,
            status: registration.status,
            registeredAt: registration.registeredAt,
          };
        }),
    [opportunityMap, periodMap, registrations],
  );

  const pendingRegistrations = registrations.filter(
    (registration) =>
      registration.status === RegistrationStatus.PENDING_COMPANY
      || registration.status === RegistrationStatus.PENDING_LECTURER,
  );

  const activeInternship = internships.find(
    (internship) => internship.status === "IN_PROGRESS",
  );

  const latestInternship = [...internships].sort(
    (left, right) =>
      new Date(right.startDate).getTime() - new Date(left.startDate).getTime(),
  )[0];

  if (loading) {
    return <LoadingState message="Đang tải bảng điều khiển sinh viên..." />;
  }

  if (error) {
    return (
      <EmptyState
        title="Không thể tải dữ liệu tổng quan"
        description={error}
        icon="bi-exclamation-triangle"
      />
    );
  }

  return (
    <div className="container-fluid px-0">
      <PageHeader
        title={`Xin chào${user?.fullName ? `, ${user.fullName}` : ""}`}
        subtitle={
          profile?.studentCode
            ? `MSSV ${profile.studentCode} • ${profile.major ?? "Chưa cập nhật ngành"}`
            : "Theo dõi đăng ký, thực tập và kết quả đánh giá của bạn."
        }
        actions={(
          <Link
            className="btn btn-primary rounded-pill px-4"
            to="/student/opportunities"
          >
            <i className="bi bi-search me-2" />
            Browse Opportunities
          </Link>
        )}
      />

      <div className="row g-4 mb-4">
        <div className="col-12 col-md-6 col-xl-3">
          <StatCard
            title="Cơ hội đang mở"
            value={openOpportunities.length}
            subtitle="Từ các đợt thực tập đang nhận đăng ký"
            icon="bi-briefcase"
            variant="success"
          />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <StatCard
            title="Đăng ký chờ duyệt"
            value={pendingRegistrations.length}
            subtitle="Đang chờ doanh nghiệp hoặc giảng viên"
            icon="bi-hourglass-split"
            variant="warning"
          />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <StatCard
            title="Thực tập hiện tại"
            value={
              activeInternship ? (
                <StatusBadge status={activeInternship.status} />
              ) : (
                "Chưa có"
              )
            }
            subtitle={
              activeInternship?.position
              ?? latestInternship?.position
              ?? "Hãy bắt đầu bằng một đăng ký mới"
            }
            icon="bi-kanban"
            variant="primary"
          />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <StatCard
            title="Điểm đánh giá"
            value={evaluationSummary?.finalScore ?? "—"}
            subtitle={
              evaluationSummary
                ? "Điểm tổng kết của kỳ thực tập gần nhất"
                : "Chưa có kết quả đánh giá"
            }
            icon="bi-award"
            variant="info"
          />
        </div>
      </div>

      <div className="row g-4">
        <div className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
                <div>
                  <h2 className="h5 mb-1">Đăng ký gần đây</h2>
                  <p className="text-secondary mb-0">
                    Theo dõi trạng thái các hồ sơ thực tập mới nhất.
                  </p>
                </div>
                <Link
                  className="btn btn-outline-primary rounded-pill"
                  to="/student/registrations"
                >
                  Xem tất cả
                </Link>
              </div>

              <DataTable
                columns={[
                  {
                    key: "opportunityLabel",
                    header: "Vị trí",
                  },
                  {
                    key: "periodLabel",
                    header: "Đợt thực tập",
                  },
                  {
                    key: "status",
                    header: "Trạng thái",
                    render: (row) => <StatusBadge status={row.status} />,
                  },
                  {
                    key: "registeredAt",
                    header: "Ngày đăng ký",
                    render: (row) => formatDate(row.registeredAt),
                  },
                  {
                    key: "action",
                    header: "",
                    className: "text-end",
                    render: (row) => (
                      <Link
                        className="btn btn-sm btn-outline-secondary rounded-pill"
                        to={`/student/workspace/${row.id}`}
                      >
                        Chi tiết
                      </Link>
                    ),
                  },
                ]}
                rows={recentRegistrations}
                rowKey={(row) => row.id}
                emptyTitle="Chưa có đăng ký nào"
                emptyDescription="Hãy khám phá cơ hội thực tập phù hợp và gửi hồ sơ đầu tiên của bạn."
              />
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-4">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-body p-4">
              <h2 className="h5 mb-3">Thông tin nhanh</h2>

              <div className="d-flex flex-column gap-3">
                <div className="p-3 rounded-3 bg-body-tertiary">
                  <div className="d-flex align-items-center gap-3">
                    <span className="icon-circle bg-primary-subtle text-primary">
                      <i className="bi bi-person-vcard fs-5" />
                    </span>
                    <div>
                      <p className="small text-secondary text-uppercase fw-semibold mb-1">
                        Hồ sơ sinh viên
                      </p>
                      <p className="mb-0 fw-semibold">
                        {profile?.className ?? "Chưa cập nhật lớp học"}
                      </p>
                      <p className="mb-0 text-secondary small">
                        {profile?.phone ?? "Chưa cập nhật số điện thoại"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-3 bg-body-tertiary">
                  <p className="small text-secondary text-uppercase fw-semibold mb-1">
                    Kỳ thực tập gần nhất
                  </p>
                  <p className="mb-1 fw-semibold">
                    {latestInternship?.position ?? "Chưa có kỳ thực tập"}
                  </p>
                  <p className="mb-0 text-secondary small">
                    {latestInternship
                      ? formatDateRange(
                        latestInternship.startDate,
                        latestInternship.endDate,
                      )
                      : "Đăng ký để bắt đầu hành trình thực tập."}
                  </p>
                </div>

                <div className="p-3 rounded-3 bg-primary-subtle">
                  <p className="fw-semibold mb-2">
                    Sẵn sàng ứng tuyển vị trí mới?
                  </p>
                  <p className="text-secondary mb-3">
                    Khám phá các cơ hội đang mở và nộp hồ sơ chỉ với một bước xác nhận.
                  </p>
                  <Link
                    className="btn btn-primary rounded-pill px-4"
                    to="/student/opportunities"
                  >
                    <i className="bi bi-send-check me-2" />
                    Browse Opportunities
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentOverviewPage;
