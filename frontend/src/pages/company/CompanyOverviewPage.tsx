import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getMyCompanyInternships } from "../../api/internship-api";
import { getInternshipOpportunities } from "../../api/internship-opportunity-api";
import { getInternshipRegistrations } from "../../api/internship-registration-api";
import { getCurrentUser } from "../../api/user-api";
import PageHeader from "../../components/ui/PageHeader";
import StatCard from "../../components/ui/StatCard";
import DataTable, {
  type DataTableColumn,
} from "../../components/ui/DataTable";
import LoadingState from "../../components/ui/LoadingState";
import StatusBadge from "../../components/ui/StatusBadge";
import type {
  CompanyProfile,
  InternshipOpportunity,
  InternshipRegistration,
  StudentSummary,
} from "../../types";
import {
  byRegisteredAtDesc,
  companyPaths,
  findOpportunityLabel,
  findUserEmail,
  findUserLabel,
  formatDateTime,
  isActiveInternship,
  isCompletedInternship,
  loadUsersByIds,
  toErrorMessage,
} from "./company-page-utils";

interface RegistrationRow {
  registration: InternshipRegistration;
  studentName: string;
  studentEmail: string;
  opportunityLabel: string;
}

function CompanyOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [companyName, setCompanyName] = useState("Doanh nghiệp");
  const [opportunities, setOpportunities] = useState<
    InternshipOpportunity[]
  >([]);
  const [registrations, setRegistrations] = useState<
    InternshipRegistration[]
  >([]);
  const [usersById, setUsersById] = useState<
    Map<number, StudentSummary>
  >(new Map());
  const [opportunitiesById, setOpportunitiesById] = useState<
    Map<number, InternshipOpportunity>
  >(new Map());
  const [activeInternCount, setActiveInternCount] = useState(0);
  const [completedInternCount, setCompletedInternCount] = useState(0);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setError("");

      try {
        const [
          currentUser,
          internshipList,
          opportunityList,
          registrationList,
        ] = await Promise.all([
          getCurrentUser(),
          getMyCompanyInternships(),
          getInternshipOpportunities(),
          getInternshipRegistrations(),
        ]);

        const users = await loadUsersByIds(
          registrationList.map(
            (registration) => registration.studentId,
          ),
        );

        const profile = currentUser.profile as CompanyProfile | null;

        setCompanyName(
          profile?.companyName?.trim() || currentUser.fullName,
        );
        setOpportunities(opportunityList);
        setRegistrations(registrationList);
        setUsersById(users);
        setOpportunitiesById(
          new Map(
            opportunityList.map((opportunity) => [
              opportunity.id,
              opportunity,
            ]),
          ),
        );
        setActiveInternCount(
          internshipList.filter(isActiveInternship).length,
        );
        setCompletedInternCount(
          internshipList.filter(isCompletedInternship).length,
        );
      } catch (loadError) {
        console.error(
          "Failed to load company overview:",
          loadError,
        );
        setError(
          toErrorMessage(
            loadError,
            "Không thể tải tổng quan doanh nghiệp.",
          ),
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const pendingRegistrationsCount = useMemo(
    () =>
      registrations.filter(
        (registration) =>
          registration.status === "PENDING_COMPANY",
      ).length,
    [registrations],
  );

  const recentRegistrationRows = useMemo<RegistrationRow[]>(
    () =>
      [...registrations]
        .sort(byRegisteredAtDesc)
        .slice(0, 5)
        .map((registration) => ({
          registration,
          studentName: findUserLabel(
            usersById,
            registration.studentId,
          ),
          studentEmail: findUserEmail(
            usersById,
            registration.studentId,
          ),
          opportunityLabel: findOpportunityLabel(
            opportunitiesById,
            registration.opportunityId,
          ),
        })),
    [opportunitiesById, registrations, usersById],
  );

  const columns = useMemo<
    DataTableColumn<RegistrationRow>[]
  >(
    () => [
      {
        key: "studentName",
        header: "Sinh viên",
        render: (row) => (
          <div>
            <div className="fw-semibold">{row.studentName}</div>
            <div className="small text-secondary">
              {row.studentEmail}
            </div>
          </div>
        ),
      },
      {
        key: "opportunityLabel",
        header: "Vị trí",
      },
      {
        key: "status",
        header: "Trạng thái",
        className: "text-nowrap",
        render: (row) => (
          <StatusBadge status={row.registration.status} />
        ),
      },
      {
        key: "registeredAt",
        header: "Ngày đăng ký",
        className: "text-nowrap",
        render: (row) =>
          formatDateTime(row.registration.registeredAt),
      },
    ],
    [],
  );

  if (loading) {
    return (
      <div className="container-fluid px-0">
        <LoadingState message="Đang tải tổng quan doanh nghiệp..." />
      </div>
    );
  }

  return (
    <div className="container-fluid px-0">
      <PageHeader
        title="Tổng quan doanh nghiệp"
        subtitle={`Theo dõi nhanh cơ hội tuyển thực tập và tiến độ xử lý hồ sơ của ${companyName}.`}
        actions={
          <Link
            to={companyPaths.newOpportunity}
            className="btn btn-primary rounded-pill px-4"
          >
            <i className="bi bi-plus-lg me-2" />
            Tạo cơ hội thực tập
          </Link>
        }
      />

      {error ? (
        <div className="alert alert-danger shadow-sm rounded-3 border-0">
          <i className="bi bi-exclamation-octagon me-2" />
          {error}
        </div>
      ) : null}

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6 col-xl-3">
          <StatCard
            title="Cơ hội đang mở"
            value={
              opportunities.filter(
                (opportunity) => opportunity.status === "OPEN",
              ).length
            }
            subtitle="Cơ hội đang mở nhận hồ sơ"
            icon="bi-briefcase"
            variant="success"
          />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <StatCard
            title="Hồ sơ chờ duyệt"
            value={pendingRegistrationsCount}
            subtitle="Hồ sơ chờ doanh nghiệp phản hồi"
            icon="bi-hourglass-split"
            variant="warning"
          />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <StatCard
            title="Thực tập sinh đang thực tập"
            value={activeInternCount}
            subtitle="Thực tập sinh đang thực tập"
            icon="bi-people"
            variant="primary"
          />
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <StatCard
            title="Đã hoàn thành"
            value={completedInternCount}
            subtitle="Đợt thực tập đã hoàn tất"
            icon="bi-check2-circle"
            variant="info"
          />
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-4">
          <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-3">
            <div>
              <h2 className="h5 mb-1">Đăng ký gần đây</h2>
              <p className="text-secondary mb-0">
                Các hồ sơ mới nhất cần theo dõi hoặc xử lý.
              </p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <Link
                to={companyPaths.registrations}
                className="btn btn-outline-primary rounded-pill"
              >
                <i className="bi bi-list-ul me-2" />
                Xem tất cả hồ sơ
              </Link>
            </div>
          </div>

          <DataTable
            columns={columns}
            rows={recentRegistrationRows}
            rowKey={(row) => row.registration.id}
            emptyTitle="Chưa có hồ sơ đăng ký"
            emptyDescription="Khi sinh viên ứng tuyển vào cơ hội thực tập của doanh nghiệp, dữ liệu sẽ hiển thị tại đây."
            tableClassName="table align-middle mb-0"
          />
        </div>
      </div>
    </div>
  );
}

export default CompanyOverviewPage;
