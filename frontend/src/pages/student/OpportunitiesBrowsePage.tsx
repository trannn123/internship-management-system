import { useEffect, useMemo, useState } from "react";
import { getInternshipOpportunities } from "../../api/internship-opportunity-api";
import { getInternshipPeriods } from "../../api/internship-period-api";
import {
  createInternshipRegistration,
  getInternshipRegistrations,
} from "../../api/internship-registration-api";
import ConfirmModal from "../../components/ui/ConfirmModal";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import { OpportunityStatus } from "../../types";
import type {
  InternshipOpportunity,
  InternshipPeriod,
  InternshipRegistration,
} from "../../types";

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

function OpportunitiesBrowsePage() {
  const [opportunities, setOpportunities] = useState<InternshipOpportunity[]>([]);
  const [periods, setPeriods] = useState<InternshipPeriod[]>([]);
  const [registrations, setRegistrations] = useState<InternshipRegistration[]>([]);
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<InternshipOpportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [opportunityData, periodData, registrationData] = await Promise.all([
        getInternshipOpportunities(),
        getInternshipPeriods(),
        getInternshipRegistrations(),
      ]);

      setOpportunities(opportunityData);
      setPeriods(periodData);
      setRegistrations(registrationData);
    } catch (loadError) {
      console.error("Failed to load opportunities:", loadError);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải danh sách cơ hội thực tập.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const periodMap = useMemo(
    () => new Map(periods.map((period) => [period.id, period])),
    [periods],
  );

  const registrationByOpportunityId = useMemo(() => {
    const map = new Map<number, InternshipRegistration>();

    for (const registration of registrations) {
      const existing = map.get(registration.opportunityId);

      if (
        !existing ||
        new Date(registration.registeredAt ?? 0).getTime() >
          new Date(existing.registeredAt ?? 0).getTime()
      ) {
        map.set(registration.opportunityId, registration);
      }
    }

    return map;
  }, [registrations]);

  const visibleOpportunities = useMemo(
    () =>
      opportunities.filter((opportunity) => {
        const period = periodMap.get(opportunity.periodId);

        return (
          opportunity.status === OpportunityStatus.OPEN
          && period?.status === "OPEN"
        );
      }),
    [opportunities, periodMap],
  );

  async function handleConfirmRegistration() {
    if (!selectedOpportunity || submittingId !== null) {
      return;
    }

    setSubmittingId(selectedOpportunity.id);
    setFeedback("");
    setError("");

    try {
      await createInternshipRegistration({
        opportunityId: selectedOpportunity.id,
      });

      setFeedback("Đăng ký đã được gửi thành công.");
      setSelectedOpportunity(null);
      await loadData();
    } catch (submitError) {
      console.error("Failed to register opportunity:", submitError);
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Không thể gửi đăng ký thực tập.",
      );
    } finally {
      setSubmittingId(null);
    }
  }

  if (loading) {
    return <LoadingState message="Đang tải cơ hội thực tập..." />;
  }

  if (error && visibleOpportunities.length === 0) {
    return (
      <EmptyState
        title="Không thể tải cơ hội thực tập"
        description={error}
        icon="bi-exclamation-triangle"
      />
    );
  }

  return (
    <div className="container-fluid px-0">
      <PageHeader
        title="Tìm cơ hội thực tập"
        subtitle="Khám phá các vị trí thực tập đang mở trong những đợt đang nhận đăng ký."
      />

      {feedback ? (
        <div className="alert alert-success border-0 shadow-sm rounded-3" role="alert">
          <i className="bi bi-check-circle me-2" />
          {feedback}
        </div>
      ) : null}

      {error ? (
        <div className="alert alert-danger border-0 shadow-sm rounded-3" role="alert">
          <i className="bi bi-exclamation-octagon me-2" />
          {error}
        </div>
      ) : null}

      {visibleOpportunities.length === 0 ? (
        <EmptyState
          title="Hiện chưa có cơ hội phù hợp"
          description="Các vị trí mở sẽ xuất hiện tại đây khi đợt thực tập đang ở trạng thái OPEN."
          icon="bi-briefcase"
        />
      ) : (
        <div className="row g-4">
          {visibleOpportunities.map((opportunity) => {
            const period = periodMap.get(opportunity.periodId);
            const myRegistration = registrationByOpportunityId.get(opportunity.id);
            const alreadyApplied = myRegistration !== undefined;
            const isSubmitting = submittingId === opportunity.id;

            return (
              <div className="col-12 col-lg-6" key={opportunity.id}>
                <div className="card border-0 shadow-sm rounded-3 h-100">
                  <div className="card-body p-4 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
                      <div>
                        <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                          <StatusBadge status={opportunity.status} />
                          {myRegistration ? (
                            <StatusBadge
                              status={myRegistration.status}
                              label={`Hồ sơ của bạn: ${myRegistration.status.replaceAll("_", " ")}`}
                            />
                          ) : null}
                          <span className="badge text-bg-light">
                            <i className="bi bi-buildings me-1" />
                            Doanh nghiệp #{opportunity.companyId}
                          </span>
                        </div>
                        <h2 className="h5 mb-1">{opportunity.position}</h2>
                        <p className="text-secondary mb-0">
                          {period?.name ?? `Đợt #${opportunity.periodId}`}
                        </p>
                      </div>
                      <span className="icon-circle bg-success-subtle text-success">
                        <i className="bi bi-briefcase fs-5" />
                      </span>
                    </div>

                    <div className="row g-3 mb-3">
                      <div className="col-sm-6">
                        <div className="p-3 rounded-3 bg-body-tertiary h-100">
                          <p className="small text-secondary text-uppercase fw-semibold mb-1">
                            Địa điểm
                          </p>
                          <p className="mb-0">{opportunity.location ?? "Chưa cập nhật"}</p>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="p-3 rounded-3 bg-body-tertiary h-100">
                          <p className="small text-secondary text-uppercase fw-semibold mb-1">
                            Số lượng
                          </p>
                          <p className="mb-0">{opportunity.quantity ?? "Không giới hạn"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="small text-secondary text-uppercase fw-semibold mb-1">
                        Mô tả
                      </p>
                      <p className="mb-0 text-secondary">
                        {opportunity.description ?? "Chưa có mô tả chi tiết cho vị trí này."}
                      </p>
                    </div>

                    <div className="mb-3">
                      <p className="small text-secondary text-uppercase fw-semibold mb-1">
                        Yêu cầu
                      </p>
                      <p className="mb-0 text-secondary">
                        {opportunity.requirements ?? "Không có yêu cầu bổ sung."}
                      </p>
                    </div>

                    <div className="border rounded-3 p-3 bg-light-subtle mb-4">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <i className="bi bi-calendar-event text-primary" />
                        <span className="fw-semibold">Thời gian đợt thực tập</span>
                      </div>
                      <p className="mb-1">
                        <span className="text-secondary">Đăng ký:</span>{" "}
                        {formatDate(period?.registrationStartDate)} -{" "}
                        {formatDate(period?.registrationEndDate)}
                      </p>
                      <p className="mb-0">
                        <span className="text-secondary">Thực tập:</span>{" "}
                        {formatDate(period?.internshipStartDate)} -{" "}
                        {formatDate(period?.internshipEndDate)}
                      </p>
                    </div>

                    <div className="mt-auto d-flex justify-content-between align-items-center gap-3 flex-wrap">
                      <small className="text-secondary">
                        Tạo lúc {formatDate(opportunity.createdAt)}
                      </small>

                      <button
                        type="button"
                        className={`btn rounded-pill px-4 ${
                          alreadyApplied
                            ? "btn-outline-secondary"
                            : "btn-primary"
                        }`}
                        disabled={alreadyApplied || isSubmitting}
                        onClick={() => setSelectedOpportunity(opportunity)}
                      >
                        {isSubmitting ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              aria-hidden="true"
                            />
                            Đang gửi...
                          </>
                        ) : myRegistration ? (
                          myRegistration.status.replaceAll("_", " ")
                        ) : (
                          <>
                            <i className="bi bi-send-check me-2" />
                            Register
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        show={selectedOpportunity !== null}
        title="Register for this opportunity?"
        message={
          selectedOpportunity
            ? `Bạn có chắc muốn đăng ký vị trí "${selectedOpportunity.position}"?`
            : ""
        }
        confirmLabel="Gửi đăng ký"
        confirmVariant="primary"
        busy={selectedOpportunity !== null && submittingId === selectedOpportunity.id}
        onCancel={() => {
          if (submittingId === null) {
            setSelectedOpportunity(null);
          }
        }}
        onConfirm={() => {
          void handleConfirmRegistration();
        }}
      />
    </div>
  );
}

export default OpportunitiesBrowsePage;
