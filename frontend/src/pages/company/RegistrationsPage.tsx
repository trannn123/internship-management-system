import { useEffect, useMemo, useState } from "react";
import {
  approveInternshipRegistrationByCompany,
  getInternshipRegistrations,
  rejectInternshipRegistrationByCompany,
} from "../../api/internship-registration-api";
import { getInternshipOpportunities } from "../../api/internship-opportunity-api";
import ConfirmModal from "../../components/ui/ConfirmModal";
import DataTable, {
  type DataTableColumn,
} from "../../components/ui/DataTable";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import type {
  InternshipOpportunity,
  InternshipRegistration,
  StudentSummary,
} from "../../types";
import {
  byRegisteredAtDesc,
  findOpportunityLabel,
  findUserEmail,
  findUserLabel,
  formatDateTime,
  loadUsersByIds,
  toErrorMessage,
} from "./company-page-utils";

type RegistrationTab = "pending" | "approved" | "rejected";
type RegistrationAction = "approve" | "reject";

interface RegistrationRow {
  registration: InternshipRegistration;
  studentName: string;
  studentEmail: string;
  opportunityLabel: string;
}

const TAB_CONFIG: Record<
  RegistrationTab,
  {
    label: string;
    icon: string;
    statuses: InternshipRegistration["status"][];
  }
> = {
  pending: {
    label: "Pending",
    icon: "bi-hourglass-split",
    statuses: ["PENDING_COMPANY"],
  },
  approved: {
    label: "Approved",
    icon: "bi-check2-circle",
    statuses: ["PENDING_LECTURER", "IN_PROGRESS", "COMPLETED"],
  },
  rejected: {
    label: "Rejected",
    icon: "bi-x-circle",
    statuses: ["REJECTED_COMPANY", "REJECTED_LECTURER"],
  },
};

function RegistrationsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] =
    useState<RegistrationTab>("pending");
  const [registrations, setRegistrations] = useState<
    InternshipRegistration[]
  >([]);
  const [usersById, setUsersById] = useState<
    Map<number, StudentSummary>
  >(new Map());
  const [opportunitiesById, setOpportunitiesById] = useState<
    Map<number, InternshipOpportunity>
  >(new Map());
  const [modalState, setModalState] = useState<{
    registration: InternshipRegistration;
    action: RegistrationAction;
  } | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    void loadRegistrations();
  }, []);

  async function loadRegistrations() {
    setLoading(true);
    setError("");

    try {
      const [registrationList, opportunities] =
        await Promise.all([
          getInternshipRegistrations(),
          getInternshipOpportunities(),
        ]);

      const users = await loadUsersByIds(
        registrationList.map(
          (registration) => registration.studentId,
        ),
      );

      setRegistrations(
        [...registrationList].sort(byRegisteredAtDesc),
      );
      setUsersById(users);
      setOpportunitiesById(
        new Map(
          opportunities.map((opportunity) => [
            opportunity.id,
            opportunity,
          ]),
        ),
      );
    } catch (loadError) {
      console.error(
        "Failed to load company registrations:",
        loadError,
      );
      setError(
        toErrorMessage(
          loadError,
          "Không thể tải danh sách hồ sơ đăng ký.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  const counts = useMemo(
    () => ({
      pending: registrations.filter((registration) =>
        TAB_CONFIG.pending.statuses.includes(registration.status),
      ).length,
      approved: registrations.filter((registration) =>
        TAB_CONFIG.approved.statuses.includes(registration.status),
      ).length,
      rejected: registrations.filter((registration) =>
        TAB_CONFIG.rejected.statuses.includes(registration.status),
      ).length,
    }),
    [registrations],
  );

  const filteredRows = useMemo<RegistrationRow[]>(
    () =>
      registrations
        .filter((registration) =>
          TAB_CONFIG[activeTab].statuses.includes(
            registration.status,
          ),
        )
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
    [activeTab, opportunitiesById, registrations, usersById],
  );

  async function handleConfirmAction() {
    if (!modalState) {
      return;
    }

    setBusyId(modalState.registration.id);
    setError("");

    try {
      const updatedRegistration =
        modalState.action === "approve"
          ? await approveInternshipRegistrationByCompany(
              modalState.registration.id,
            )
          : await rejectInternshipRegistrationByCompany(
              modalState.registration.id,
            );

      setRegistrations((current) =>
        current.map((registration) =>
          registration.id === updatedRegistration.id
            ? updatedRegistration
            : registration,
        ),
      );
      setModalState(null);
    } catch (actionError) {
      console.error(
        "Failed to update registration:",
        actionError,
      );
      setError(
        toErrorMessage(
          actionError,
          "Không thể cập nhật trạng thái hồ sơ.",
        ),
      );
    } finally {
      setBusyId(null);
    }
  }

  const columns = useMemo<
    DataTableColumn<RegistrationRow>[]
  >(
    () => [
      {
        key: "studentName",
        header: "Sinh viên",
        render: (row) => (
          <div>
            <div className="fw-semibold">
              {row.studentName}
            </div>
            <div className="small text-secondary">
              {row.studentEmail}
            </div>
          </div>
        ),
      },
      {
        key: "opportunityLabel",
        header: "Cơ hội / vị trí",
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
      {
        key: "actions",
        header: "Thao tác",
        className: "text-end text-nowrap",
        render: (row) =>
          row.registration.status === "PENDING_COMPANY" ? (
            <div className="d-inline-flex flex-wrap justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-sm btn-success rounded-pill"
                onClick={() =>
                  setModalState({
                    registration: row.registration,
                    action: "approve",
                  })
                }
                disabled={busyId === row.registration.id}
              >
                <i className="bi bi-check2 me-1" />
                Approve
              </button>
              <button
                type="button"
                className="btn btn-sm btn-outline-danger rounded-pill"
                onClick={() =>
                  setModalState({
                    registration: row.registration,
                    action: "reject",
                  })
                }
                disabled={busyId === row.registration.id}
              >
                <i className="bi bi-x-lg me-1" />
                Reject
              </button>
            </div>
          ) : (
            <span className="text-secondary small">
              Không có thao tác
            </span>
          ),
      },
    ],
    [busyId],
  );

  if (loading) {
    return (
      <div className="container-fluid px-0">
        <LoadingState message="Đang tải hồ sơ đăng ký..." />
      </div>
    );
  }

  return (
    <div className="container-fluid px-0">
      <PageHeader
        title="Đăng ký"
        subtitle="Theo dõi và duyệt hồ sơ ứng tuyển của sinh viên theo từng trạng thái."
      />

      {error ? (
        <div className="alert alert-danger shadow-sm rounded-3 border-0">
          <i className="bi bi-exclamation-octagon me-2" />
          {error}
        </div>
      ) : null}

      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-3 p-lg-4">
          <ul className="nav nav-tabs border-0 gap-2">
            {(Object.keys(TAB_CONFIG) as RegistrationTab[]).map(
              (tab) => (
                <li className="nav-item" key={tab}>
                  <button
                    type="button"
                    className={`nav-link rounded-pill border ${
                      activeTab === tab
                        ? "active"
                        : "text-secondary"
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    <i
                      className={`bi ${TAB_CONFIG[tab].icon} me-2`}
                    />
                    {TAB_CONFIG[tab].label}
                    <span className="badge text-bg-light ms-2">
                      {counts[tab]}
                    </span>
                  </button>
                </li>
              ),
            )}
          </ul>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={filteredRows}
        rowKey={(row) => row.registration.id}
        emptyTitle="Không có hồ sơ trong bộ lọc này"
        emptyDescription="Thử chuyển sang tab khác hoặc chờ thêm hồ sơ mới."
      />

      <ConfirmModal
        show={modalState !== null}
        title={
          modalState?.action === "approve"
            ? "Xác nhận duyệt hồ sơ"
            : "Xác nhận từ chối hồ sơ"
        }
        message={
          modalState?.action === "approve"
            ? "Bạn có chắc muốn duyệt hồ sơ này? Hồ sơ sẽ chuyển sang bước chờ giảng viên xử lý."
            : "Bạn có chắc muốn từ chối hồ sơ này?"
        }
        confirmLabel={
          modalState?.action === "approve"
            ? "Duyệt hồ sơ"
            : "Từ chối hồ sơ"
        }
        confirmVariant={
          modalState?.action === "approve"
            ? "success"
            : "danger"
        }
        busy={modalState ? busyId === modalState.registration.id : false}
        onConfirm={() => void handleConfirmAction()}
        onCancel={() => {
          if (busyId === null) {
            setModalState(null);
          }
        }}
      />
    </div>
  );
}

export default RegistrationsPage;
