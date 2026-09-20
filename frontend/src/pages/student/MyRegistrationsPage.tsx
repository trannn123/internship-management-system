import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getInternshipOpportunities } from "../../api/internship-opportunity-api";
import { getInternshipPeriods } from "../../api/internship-period-api";
import { getInternshipRegistrations } from "../../api/internship-registration-api";
import DataTable from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import type {
  InternshipOpportunity,
  InternshipPeriod,
  InternshipRegistration,
} from "../../types";

interface RegistrationTableRow {
  id: number;
  opportunity: string;
  company: string;
  period: string;
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

function MyRegistrationsPage() {
  const [registrations, setRegistrations] = useState<InternshipRegistration[]>([]);
  const [opportunities, setOpportunities] = useState<InternshipOpportunity[]>([]);
  const [periods, setPeriods] = useState<InternshipPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [registrationData, opportunityData, periodData] = await Promise.all([
          getInternshipRegistrations(),
          getInternshipOpportunities(),
          getInternshipPeriods(),
        ]);

        setRegistrations(registrationData);
        setOpportunities(opportunityData);
        setPeriods(periodData);
      } catch (loadError) {
        console.error("Failed to load student registrations:", loadError);
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Không thể tải danh sách đăng ký.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);

  const opportunityMap = useMemo(
    () => new Map(opportunities.map((opportunity) => [opportunity.id, opportunity])),
    [opportunities],
  );

  const periodMap = useMemo(
    () => new Map(periods.map((period) => [period.id, period])),
    [periods],
  );

  const rows = useMemo<RegistrationTableRow[]>(
    () =>
      [...registrations]
        .sort(
          (left, right) =>
            new Date(right.registeredAt ?? 0).getTime()
            - new Date(left.registeredAt ?? 0).getTime(),
        )
        .map((registration) => {
          const opportunity = opportunityMap.get(registration.opportunityId);
          const period = periodMap.get(registration.periodId);

          return {
            id: registration.id,
            opportunity: opportunity?.position ?? `Cơ hội #${registration.opportunityId}`,
            company: opportunity
              ? `Doanh nghiệp #${opportunity.companyId}`
              : `Doanh nghiệp #${registration.companyId}`,
            period: period?.name ?? `Đợt #${registration.periodId}`,
            status: registration.status,
            registeredAt: registration.registeredAt,
          };
        }),
    [opportunityMap, periodMap, registrations],
  );

  if (loading) {
    return <LoadingState message="Đang tải đăng ký của bạn..." />;
  }

  if (error && rows.length === 0) {
    return (
      <EmptyState
        title="Không thể tải danh sách đăng ký"
        description={error}
        icon="bi-exclamation-triangle"
      />
    );
  }

  return (
    <div className="container-fluid px-0">
      <PageHeader
        title="Đăng ký của tôi"
        subtitle="Theo dõi tất cả hồ sơ thực tập bạn đã gửi và trạng thái xử lý hiện tại."
      />

      {error ? (
        <div className="alert alert-danger border-0 shadow-sm rounded-3" role="alert">
          <i className="bi bi-exclamation-octagon me-2" />
          {error}
        </div>
      ) : null}

      <DataTable
        columns={[
          {
            key: "opportunity",
            header: "Cơ hội / Vị trí",
            render: (row) => (
              <div>
                <div className="fw-semibold">{row.opportunity}</div>
                <small className="text-secondary">{row.company}</small>
              </div>
            ),
          },
          {
            key: "period",
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
            key: "actions",
            header: "",
            className: "text-end",
            render: (row) => (
              <Link
                className="btn btn-sm btn-outline-primary rounded-pill"
                to={`/student/workspace/${row.id}`}
              >
                View Details
              </Link>
            ),
          },
        ]}
        rows={rows}
        rowKey={(row) => row.id}
        emptyTitle="Bạn chưa có đăng ký nào"
        emptyDescription="Hãy vào trang cơ hội thực tập để gửi hồ sơ đầu tiên."
      />
    </div>
  );
}

export default MyRegistrationsPage;
