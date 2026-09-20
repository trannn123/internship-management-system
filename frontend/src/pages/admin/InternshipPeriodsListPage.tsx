import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getInternshipPeriods,
  updateInternshipPeriod,
} from "../../api/internship-period-api";
import ConfirmModal from "../../components/ui/ConfirmModal";
import DataTable, {
  type DataTableColumn,
} from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import type { InternshipPeriod } from "../../types";

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

function formatDateRange(startDate: string | null, endDate: string | null) {
  return `${formatDate(startDate)} → ${formatDate(endDate)}`;
}

function InternshipPeriodsListPage() {
  const [periods, setPeriods] = useState<InternshipPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toggleTarget, setToggleTarget] = useState<InternshipPeriod | null>(null);
  const [busyPeriodId, setBusyPeriodId] = useState<number | null>(null);

  useEffect(() => {
    async function loadPeriods() {
      try {
        const data = await getInternshipPeriods();
        setPeriods(data);
      } catch (loadError) {
        console.error("Failed to load internship periods:", loadError);
        setError("Không thể tải danh sách đợt thực tập.");
      } finally {
        setLoading(false);
      }
    }

    loadPeriods();
  }, []);

  const sortedPeriods = useMemo(() => {
    return [...periods].sort((left, right) => {
      const leftValue = left.createdAt ?? "";
      const rightValue = right.createdAt ?? "";

      return rightValue.localeCompare(leftValue);
    });
  }, [periods]);

  async function handleToggleStatus() {
    if (!toggleTarget) {
      return;
    }

    if (
      toggleTarget.status !== "OPEN" &&
      toggleTarget.status !== "CLOSED" &&
      toggleTarget.status !== "DRAFT"
    ) {
      setError("Chỉ có thể mở hoặc đóng các đợt ở trạng thái DRAFT, OPEN hoặc CLOSED.");
      setToggleTarget(null);
      return;
    }

    const nextStatus = toggleTarget.status === "OPEN" ? "CLOSED" : "OPEN";
    setBusyPeriodId(toggleTarget.id);
    setError("");

    try {
      const updated = await updateInternshipPeriod(toggleTarget.id, {
        name: toggleTarget.name,
        description: toggleTarget.description,
        registrationStartDate: toggleTarget.registrationStartDate,
        registrationEndDate: toggleTarget.registrationEndDate,
        internshipStartDate: toggleTarget.internshipStartDate,
        internshipEndDate: toggleTarget.internshipEndDate,
        status: nextStatus,
      });

      setPeriods((current) =>
        current.map((period) => (period.id === updated.id ? updated : period)),
      );
      setToggleTarget(null);
    } catch (toggleError) {
      console.error("Failed to update internship period status:", toggleError);
      setError("Không thể cập nhật trạng thái đợt thực tập.");
    } finally {
      setBusyPeriodId(null);
    }
  }

  const columns: DataTableColumn<InternshipPeriod>[] = [
    {
      key: "name",
      header: "Tên đợt",
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
      header: "Thời gian đăng ký",
      render: (period) =>
        formatDateRange(
          period.registrationStartDate,
          period.registrationEndDate,
        ),
    },
    {
      key: "internshipDates",
      header: "Thời gian thực tập",
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
      header: "Thao tác",
      className: "text-end text-nowrap",
      render: (period) => {
        const isBusy = busyPeriodId === period.id;
        const canClose = period.status === "OPEN";
        const canToggle =
          period.status === "OPEN" ||
          period.status === "CLOSED" ||
          period.status === "DRAFT";
        const toggleLabel = canClose ? "Đóng" : "Mở";
        const toggleIcon = canClose ? "bi-lock" : "bi-unlock";
        const toggleVariant = canClose ? "btn-outline-secondary" : "btn-outline-success";

        return (
          <div className="d-inline-flex flex-wrap justify-content-end gap-2">
            <Link
              to={`/admin/periods/${period.id}`}
              className="btn btn-sm btn-outline-primary"
            >
              <i className="bi bi-eye me-1" />
              Xem
            </Link>
            <Link
              to={`/admin/periods/${period.id}/edit`}
              className="btn btn-sm btn-outline-secondary"
            >
              <i className="bi bi-pencil-square me-1" />
              Sửa
            </Link>
            <button
              type="button"
              className={`btn btn-sm ${toggleVariant}`}
              disabled={isBusy || !canToggle}
              onClick={() => setToggleTarget(period)}
            >
              <i className={`bi ${toggleIcon} me-1`} />
              {toggleLabel}
            </button>
            <Link
              to={`/admin/periods/${period.id}`}
              className="btn btn-sm btn-outline-info"
            >
              <i className="bi bi-person-workspace me-1" />
              Phân công giảng viên
            </Link>
          </div>
        );
      },
    },
  ];

  return (
    <div className="d-flex flex-column gap-4">
      <PageHeader
        title="Quản lý đợt thực tập"
        subtitle="Tạo mới, cập nhật và điều phối giảng viên cho từng đợt thực tập."
        actions={(
          <Link to="/admin/periods/new" className="btn btn-primary shadow-sm">
            <i className="bi bi-plus-circle me-2" />
            Tạo kỳ thực tập
          </Link>
        )}
      />

      {error ? (
        <div className="alert alert-danger border-0 shadow-sm mb-0" role="alert">
          {error}
        </div>
      ) : null}

      {loading ? (
        <DataTable
          columns={columns}
          rows={[]}
          rowKey={(period) => period.id}
          loading
          loadingMessage="Đang tải danh sách đợt thực tập..."
        />
      ) : sortedPeriods.length === 0 ? (
        <EmptyState
          title="Chưa có đợt thực tập nào"
          description="Bắt đầu bằng cách tạo đợt thực tập đầu tiên cho hệ thống."
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
          rows={sortedPeriods}
          rowKey={(period) => period.id}
        />
      )}

      <ConfirmModal
        show={toggleTarget !== null}
        title={toggleTarget?.status === "OPEN" ? "Đóng đợt thực tập" : "Mở đợt thực tập"}
        message={
          toggleTarget
            ? `Bạn có chắc muốn ${
                toggleTarget.status === "OPEN" ? "đóng" : "mở"
              } đợt "${toggleTarget.name}" không?`
            : ""
        }
        confirmLabel={toggleTarget?.status === "OPEN" ? "Đóng đợt" : "Mở đợt"}
        confirmVariant={toggleTarget?.status === "OPEN" ? "secondary" : "success"}
        busy={busyPeriodId !== null}
        onCancel={() => {
          if (busyPeriodId === null) {
            setToggleTarget(null);
          }
        }}
        onConfirm={() => {
          void handleToggleStatus();
        }}
      />
    </div>
  );
}

export default InternshipPeriodsListPage;
