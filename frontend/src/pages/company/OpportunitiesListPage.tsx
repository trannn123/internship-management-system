import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getInternshipOpportunities,
  updateInternshipOpportunity,
} from "../../api/internship-opportunity-api";
import DataTable, {
  type DataTableColumn,
} from "../../components/ui/DataTable";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import type {
  InternshipOpportunity,
  InternshipOpportunityRequest,
} from "../../types";
import {
  byCreatedAtDesc,
  companyPaths,
  formatDateTime,
  toErrorMessage,
} from "./company-page-utils";

function OpportunitiesListPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [opportunities, setOpportunities] = useState<
    InternshipOpportunity[]
  >([]);
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<InternshipOpportunity | null>(null);

  useEffect(() => {
    void loadOpportunities();
  }, []);

  async function loadOpportunities() {
    setLoading(true);
    setError("");

    try {
      const data = await getInternshipOpportunities();
      const sorted = [...data].sort(byCreatedAtDesc);
      setOpportunities(sorted);
      setSelectedOpportunity((current) =>
        current
          ? sorted.find((item) => item.id === current.id) ?? null
          : null,
      );
    } catch (loadError) {
      console.error(
        "Failed to load company opportunities:",
        loadError,
      );
      setError(
        toErrorMessage(
          loadError,
          "Không thể tải danh sách cơ hội thực tập.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(
    opportunity: InternshipOpportunity,
  ) {
    const nextStatus =
      opportunity.status === "OPEN" ? "CLOSED" : "OPEN";

    const payload: InternshipOpportunityRequest = {
      periodId: opportunity.periodId,
      position: opportunity.position,
      description: opportunity.description,
      requirements: opportunity.requirements,
      location: opportunity.location,
      quantity: opportunity.quantity,
      status: nextStatus,
    };

    setBusyId(opportunity.id);
    setError("");

    try {
      const updatedOpportunity =
        await updateInternshipOpportunity(
          opportunity.id,
          payload,
        );

      setOpportunities((current) =>
        current
          .map((item) =>
            item.id === updatedOpportunity.id
              ? updatedOpportunity
              : item,
          )
          .sort(byCreatedAtDesc),
      );

      setSelectedOpportunity((current) =>
        current?.id === updatedOpportunity.id
          ? updatedOpportunity
          : current,
      );
    } catch (updateError) {
      console.error(
        "Failed to update opportunity status:",
        updateError,
      );
      setError(
        toErrorMessage(
          updateError,
          "Không thể cập nhật trạng thái cơ hội thực tập.",
        ),
      );
    } finally {
      setBusyId(null);
    }
  }

  const columns = useMemo<
    DataTableColumn<InternshipOpportunity>[]
  >(
    () => [
      {
        key: "position",
        header: "Vị trí",
        render: (opportunity) => (
          <div>
            <div className="fw-semibold">
              {opportunity.position}
            </div>
            <div className="small text-secondary">
              {opportunity.location || "Chưa cập nhật địa điểm"}
            </div>
          </div>
        ),
      },
      {
        key: "periodId",
        header: "Kỳ thực tập",
        className: "text-nowrap",
        render: (opportunity) => `#${opportunity.periodId}`,
      },
      {
        key: "quantity",
        header: "Số lượng",
        className: "text-nowrap",
        render: (opportunity) =>
          opportunity.quantity ?? "—",
      },
      {
        key: "status",
        header: "Trạng thái",
        className: "text-nowrap",
        render: (opportunity) => (
          <StatusBadge status={opportunity.status} />
        ),
      },
      {
        key: "createdAt",
        header: "Ngày tạo",
        className: "text-nowrap",
        render: (opportunity) =>
          formatDateTime(opportunity.createdAt),
      },
      {
        key: "actions",
        header: "Thao tác",
        className: "text-end text-nowrap",
        render: (opportunity) => (
          <div className="d-inline-flex flex-wrap justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-pill"
              onClick={() => setSelectedOpportunity(opportunity)}
            >
              <i className="bi bi-eye me-1" />
              View
            </button>
            <Link
              to={companyPaths.editOpportunity(opportunity.id)}
              className="btn btn-sm btn-outline-primary rounded-pill"
            >
              <i className="bi bi-pencil-square me-1" />
              Edit
            </Link>
            <button
              type="button"
              className={`btn btn-sm rounded-pill ${
                opportunity.status === "OPEN"
                  ? "btn-outline-secondary"
                  : "btn-outline-success"
              }`}
              onClick={() => void handleToggleStatus(opportunity)}
              disabled={busyId === opportunity.id}
            >
              <i
                className={`bi ${
                  opportunity.status === "OPEN"
                    ? "bi-pause-circle"
                    : "bi-play-circle"
                } me-1`}
              />
              {busyId === opportunity.id
                ? "Đang cập nhật..."
                : opportunity.status === "OPEN"
                  ? "Close"
                  : "Open"}
            </button>
          </div>
        ),
      },
    ],
    [busyId],
  );

  if (loading) {
    return (
      <div className="container-fluid px-0">
        <LoadingState message="Đang tải cơ hội thực tập..." />
      </div>
    );
  }

  return (
    <div className="container-fluid px-0">
      <PageHeader
        title="Cơ hội thực tập"
        subtitle="Quản lý toàn bộ cơ hội thực tập do doanh nghiệp đăng tuyển."
        actions={
          <Link
            to={companyPaths.newOpportunity}
            className="btn btn-primary rounded-pill px-4"
          >
            <i className="bi bi-plus-lg me-2" />
            Create Opportunity
          </Link>
        }
      />

      {error ? (
        <div className="alert alert-danger shadow-sm rounded-3 border-0">
          <i className="bi bi-exclamation-octagon me-2" />
          {error}
        </div>
      ) : null}

      {selectedOpportunity ? (
        <div className="card border-0 shadow-sm rounded-3 mb-4">
          <div className="card-body p-4">
            <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-3">
              <div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <h2 className="h5 mb-0">
                    {selectedOpportunity.position}
                  </h2>
                  <StatusBadge
                    status={selectedOpportunity.status}
                  />
                </div>
                <p className="text-secondary mb-0">
                  Kỳ thực tập #{selectedOpportunity.periodId} ·{" "}
                  {selectedOpportunity.location || "Chưa có địa điểm"}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-outline-secondary rounded-pill align-self-start"
                onClick={() => setSelectedOpportunity(null)}
              >
                <i className="bi bi-x-lg me-2" />
                Đóng
              </button>
            </div>

            <div className="row g-3">
              <div className="col-12 col-lg-6">
                <div className="p-3 bg-body-tertiary rounded-3 h-100">
                  <p className="small text-uppercase text-secondary fw-semibold mb-2">
                    Mô tả
                  </p>
                  <p className="mb-0">
                    {selectedOpportunity.description ||
                      "Chưa có mô tả."}
                  </p>
                </div>
              </div>
              <div className="col-12 col-lg-6">
                <div className="p-3 bg-body-tertiary rounded-3 h-100">
                  <p className="small text-uppercase text-secondary fw-semibold mb-2">
                    Yêu cầu
                  </p>
                  <p className="mb-0">
                    {selectedOpportunity.requirements ||
                      "Chưa có yêu cầu."}
                  </p>
                </div>
              </div>
              <div className="col-12 col-lg-4">
                <div className="p-3 bg-body-tertiary rounded-3">
                  <p className="small text-uppercase text-secondary fw-semibold mb-2">
                    Số lượng
                  </p>
                  <p className="fw-semibold mb-0">
                    {selectedOpportunity.quantity ?? "—"}
                  </p>
                </div>
              </div>
              <div className="col-12 col-lg-4">
                <div className="p-3 bg-body-tertiary rounded-3">
                  <p className="small text-uppercase text-secondary fw-semibold mb-2">
                    Ngày tạo
                  </p>
                  <p className="fw-semibold mb-0">
                    {formatDateTime(selectedOpportunity.createdAt)}
                  </p>
                </div>
              </div>
              <div className="col-12 col-lg-4">
                <div className="p-3 bg-body-tertiary rounded-3">
                  <p className="small text-uppercase text-secondary fw-semibold mb-2">
                    Cập nhật gần nhất
                  </p>
                  <p className="fw-semibold mb-0">
                    {formatDateTime(selectedOpportunity.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <DataTable
        columns={columns}
        rows={opportunities}
        rowKey={(opportunity) => opportunity.id}
        emptyTitle="Chưa có cơ hội thực tập"
        emptyDescription="Hãy tạo cơ hội đầu tiên để bắt đầu tiếp nhận hồ sơ ứng tuyển."
      />
    </div>
  );
}

export default OpportunitiesListPage;
