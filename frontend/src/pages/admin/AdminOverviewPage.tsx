import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getInternshipOpportunities } from "../../api/internship-opportunity-api";
import { getInternshipPeriods } from "../../api/internship-period-api";
import { getInternshipRegistrations } from "../../api/internship-registration-api";
import { useAuth } from "../../hooks/useAuth";
import type {
  InternshipPeriod,
  InternshipRegistration,
  InternshipOpportunity,
} from "../../types";
import DataTable, {
  type DataTableColumn,
} from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import StatusBadge from "../../components/ui/StatusBadge";

interface DashboardData {
  periods: InternshipPeriod[];
  opportunities: InternshipOpportunity[];
  registrations: InternshipRegistration[];
}

function formatDateRange(startDate: string | null, endDate: string | null) {
  const start = formatDate(startDate);
  const end = formatDate(endDate);

  if (start === "—" && end === "—") {
    return "—";
  }

  return `${start} → ${end}`;
}

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleDateString("vi-VN");
}

function AdminOverviewPage() {
  const { username } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadOverview() {
      try {
        const [periods, opportunities, registrations] = await Promise.all([
          getInternshipPeriods(),
          getInternshipOpportunities(),
          getInternshipRegistrations(),
        ]);

        setData({
          periods,
          opportunities,
          registrations,
        });
      } catch (loadError) {
        console.error("Failed to load admin overview:", loadError);
        setError("Không thể tải dữ liệu tổng quan quản trị.");
      } finally {
        setLoading(false);
      }
    }

    loadOverview();
  }, []);

  const recentPeriods = useMemo(() => {
    return [...(data?.periods ?? [])]
      .sort((left, right) => {
        const leftValue = left.updatedAt ?? left.createdAt ?? "";
        const rightValue = right.updatedAt ?? right.createdAt ?? "";

        return rightValue.localeCompare(leftValue);
      })
      .slice(0, 5);
  }, [data]);

  const columns: DataTableColumn<InternshipPeriod>[] = [
    {
      key: "name",
      header: "Đợt thực tập",
      render: (period) => (
        <div>
          <p className="fw-semibold mb-1">{period.name}</p>
          <p className="text-secondary small mb-0">
            ID: {period.id}
          </p>
        </div>
      ),
    },
    {
      key: "registrationDates",
      header: "Đăng ký",
      render: (period) =>
        formatDateRange(
          period.registrationStartDate,
          period.registrationEndDate,
        ),
    },
    {
      key: "internshipDates",
      header: "Thực tập",
      render: (period) =>
        formatDateRange(
          period.internshipStartDate,
          period.internshipEndDate,
        ),
    },
    {
      key: "status",
      header: "Trạng thái",
      className: "text-nowrap",
      render: (period) => <StatusBadge status={period.status} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-end text-nowrap",
      render: (period) => (
        <Link
          to={`/admin/periods/${period.id}`}
          className="btn btn-sm btn-outline-primary"
        >
          <i className="bi bi-arrow-right-circle me-1" />
          Chi tiết
        </Link>
      ),
    },
  ];

  return (
    <div className="d-flex flex-column gap-4">
      <PageHeader
        title="Tổng quan quản trị"
        subtitle={`Xin chào ${username}. Theo dõi nhanh các đợt thực tập, cơ hội và đăng ký trong hệ thống.`}
        actions={(
          <Link to="/admin/periods/new" className="btn btn-primary shadow-sm">
            <i className="bi bi-plus-circle me-2" />
            Tạo kỳ thực tập mới
          </Link>
        )}
      />

      {error ? (
        <div className="alert alert-danger shadow-sm border-0 mb-0" role="alert">
          {error}
        </div>
      ) : null}

      <div className="row g-3">
        <div className="col-12 col-md-6 col-xl-3">
          <StatCard
            title="Tổng đợt thực tập"
            value={data?.periods.length ?? 0}
            subtitle="Tất cả kỳ thực tập"
            icon="bi-calendar2-range"
            variant="primary"
          />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <StatCard
            title="Đợt đang mở"
            value={
              data?.periods.filter((period) => period.status === "OPEN").length ?? 0
            }
            subtitle="Sẵn sàng nhận đăng ký"
            icon="bi-unlock"
            variant="success"
          />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <StatCard
            title="Cơ hội thực tập"
            value={data?.opportunities.length ?? 0}
            subtitle="Tổng tin tuyển thực tập"
            icon="bi-briefcase"
            variant="info"
          />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <StatCard
            title="Đăng ký thực tập"
            value={data?.registrations.length ?? 0}
            subtitle="Tổng số hồ sơ đã nộp"
            icon="bi-file-earmark-text"
            variant="warning"
          />
        </div>
      </div>

      <section className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-4">
          <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
            <div>
              <h2 className="h5 mb-1">Đợt thực tập gần đây</h2>
              <p className="text-secondary mb-0">
                Theo dõi nhanh các đợt vừa được cập nhật trong hệ thống.
              </p>
            </div>
            <Link to="/admin/periods" className="btn btn-outline-secondary">
              <i className="bi bi-table me-2" />
              Xem tất cả
            </Link>
          </div>

          {loading ? (
            <DataTable
              columns={columns}
              rows={[]}
              rowKey={(period) => period.id}
              loading
              loadingMessage="Đang tải dữ liệu tổng quan..."
            />
          ) : recentPeriods.length === 0 ? (
            <EmptyState
              title="Chưa có đợt thực tập"
              description="Hãy tạo đợt thực tập đầu tiên để bắt đầu quản lý chu kỳ thực tập."
              icon="bi-calendar2-plus"
              action={(
                <Link to="/admin/periods/new" className="btn btn-primary">
                  <i className="bi bi-plus-circle me-2" />
                  Tạo đợt thực tập
                </Link>
              )}
            />
          ) : (
            <DataTable
              columns={columns}
              rows={recentPeriods}
              rowKey={(period) => period.id}
            />
          )}
        </div>
      </section>
    </div>
  );
}

export default AdminOverviewPage;
