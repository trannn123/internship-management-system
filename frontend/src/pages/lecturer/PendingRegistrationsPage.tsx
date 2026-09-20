import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  approveInternshipRegistrationByLecturer,
  getInternshipRegistrations,
  rejectInternshipRegistrationByLecturer,
} from "../../api/internship-registration-api";
import DataTable, {
  type DataTableColumn,
} from "../../components/ui/DataTable";
import ConfirmModal from "../../components/ui/ConfirmModal";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import type { InternshipRegistration } from "../../types";
import {
  formatDateTime,
  getCompanyDisplayName,
  getDisplayName,
  getErrorMessage,
  loadRegistrationMetadata,
} from "./lecturer-helpers";

interface RegistrationQueueRow {
  registration: InternshipRegistration;
  studentName: string;
  companyName: string;
  position: string;
  periodName: string;
}

interface QueueAction {
  registrationId: number;
  type: "approve" | "reject";
}

interface LocationState {
  focusRegistrationId?: number;
}

function PendingRegistrationsPage() {
  const location = useLocation();
  const state = location.state as LocationState | null;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<RegistrationQueueRow[]>([]);
  const [activeAction, setActiveAction] = useState<QueueAction | null>(null);
  const [busyRegistrationId, setBusyRegistrationId] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    async function loadPendingRegistrations() {
      try {
        const registrations = await getInternshipRegistrations();
        const pendingRegistrations = registrations
          .filter((registration) => registration.status === "PENDING_LECTURER")
          .sort((left, right) => {
            const leftTime = new Date(left.registeredAt ?? 0).getTime();
            const rightTime = new Date(right.registeredAt ?? 0).getTime();

            return rightTime - leftTime;
          });

        const metadata = await loadRegistrationMetadata(pendingRegistrations);

        setRows(
          pendingRegistrations.map((registration) => ({
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
        console.error("Failed to load pending lecturer registrations:", loadError);
        setError(
          getErrorMessage(loadError, "Không thể tải hàng chờ duyệt của giảng viên."),
        );
      } finally {
        setLoading(false);
      }
    }

    loadPendingRegistrations();
  }, []);

  const highlightedRegistrationId = state?.focusRegistrationId ?? null;

  const sortedRows = useMemo(() => {
    if (!highlightedRegistrationId) {
      return rows;
    }

    return [...rows].sort((left, right) => {
      if (left.registration.id === highlightedRegistrationId) {
        return -1;
      }

      if (right.registration.id === highlightedRegistrationId) {
        return 1;
      }

      return 0;
    });
  }, [highlightedRegistrationId, rows]);

  async function handleConfirmAction() {
    if (!activeAction) {
      return;
    }

    const { registrationId, type } = activeAction;
    setBusyRegistrationId(registrationId);
    setFeedback("");
    setError("");

    try {
      if (type === "approve") {
        await approveInternshipRegistrationByLecturer(registrationId);
      } else {
        await rejectInternshipRegistrationByLecturer(registrationId);
      }

      setRows((currentRows) =>
        currentRows.filter((row) => row.registration.id !== registrationId),
      );
      setFeedback(
        type === "approve"
          ? "Đã duyệt hồ sơ thành công."
          : "Đã từ chối hồ sơ thành công.",
      );
      setActiveAction(null);
    } catch (actionError) {
      console.error("Failed to process lecturer registration action:", actionError);
      setError(getErrorMessage(actionError, "Không thể xử lý hồ sơ này."));
    } finally {
      setBusyRegistrationId(null);
    }
  }

  const columns: DataTableColumn<RegistrationQueueRow>[] = [
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
      key: "actions",
      header: "",
      className: "text-end",
      render: (row) => {
        const isBusy = busyRegistrationId === row.registration.id;

        return (
          <div className="d-flex justify-content-end gap-2 flex-wrap">
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={() =>
                setActiveAction({
                  registrationId: row.registration.id,
                  type: "reject",
                })
              }
              disabled={isBusy}
            >
              {isBusy && activeAction?.type === "reject" ? (
                <span
                  className="spinner-border spinner-border-sm me-1"
                  aria-hidden="true"
                />
              ) : (
                <i className="bi bi-x-circle me-1" />
              )}
              Từ chối
            </button>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={() =>
                setActiveAction({
                  registrationId: row.registration.id,
                  type: "approve",
                })
              }
              disabled={isBusy}
            >
              {isBusy && activeAction?.type === "approve" ? (
                <span
                  className="spinner-border spinner-border-sm me-1"
                  aria-hidden="true"
                />
              ) : (
                <i className="bi bi-check2-circle me-1" />
              )}
              Duyệt
            </button>
          </div>
        );
      },
    },
  ];

  if (loading) {
    return <LoadingState message="Đang tải hàng chờ duyệt..." />;
  }

  return (
    <div className="d-flex flex-column gap-4">
      <PageHeader
        title="Hồ sơ chờ giảng viên duyệt"
        subtitle="Chỉ hiển thị các đăng ký đã được phân công cho bạn xử lý."
        actions={
          <Link to="/lecturer/students" className="btn btn-outline-primary">
            <i className="bi bi-people me-2" />
            Xem sinh viên đang phụ trách
          </Link>
        }
      />

      {feedback ? (
        <div className="alert alert-success shadow-sm border-0 rounded-3 mb-0">
          <i className="bi bi-check-circle me-2" />
          {feedback}
        </div>
      ) : null}

      {error ? (
        <div className="alert alert-danger shadow-sm border-0 rounded-3 mb-0">
          <i className="bi bi-exclamation-triangle me-2" />
          {error}
        </div>
      ) : null}

      {sortedRows.length === 0 ? (
        <EmptyState
          title="Không còn hồ sơ chờ duyệt"
          description="Tất cả đăng ký được phân công cho bạn đã được xử lý."
          icon="bi-clipboard-check"
        />
      ) : (
        <DataTable
          columns={columns}
          rows={sortedRows}
          rowKey={(row) => row.registration.id}
          emptyTitle="Không còn hồ sơ chờ duyệt"
          emptyDescription="Tất cả đăng ký được phân công cho bạn đã được xử lý."
        />
      )}

      <ConfirmModal
        show={activeAction !== null}
        title={
          activeAction?.type === "approve"
            ? "Xác nhận duyệt hồ sơ"
            : "Xác nhận từ chối hồ sơ"
        }
        message={
          activeAction?.type === "approve"
            ? "Sau khi duyệt, sinh viên sẽ được chuyển sang giai đoạn thực tập."
            : "Sau khi từ chối, hồ sơ sẽ không còn nằm trong hàng chờ của bạn."
        }
        confirmLabel={activeAction?.type === "approve" ? "Duyệt hồ sơ" : "Từ chối hồ sơ"}
        confirmVariant={activeAction?.type === "approve" ? "primary" : "danger"}
        busy={busyRegistrationId === activeAction?.registrationId}
        onCancel={() => {
          if (busyRegistrationId === null) {
            setActiveAction(null);
          }
        }}
        onConfirm={() => {
          void handleConfirmAction();
        }}
      />
    </div>
  );
}

export default PendingRegistrationsPage;
