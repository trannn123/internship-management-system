import { useEffect, useMemo, useState } from "react";
import {
  createWorkPlan,
  getMyCompanyInternships,
  getWorkPlanByInternshipId,
} from "../../api/internship-api";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import type { Internship, StudentSummary, WorkPlanRequest } from "../../types";
import {
  findUserLabel,
  formatDate,
  formatDateRange,
  isActiveInternship,
  loadUsersByIds,
  toErrorMessage,
} from "./company-page-utils";

interface WorkPlanDraft {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
}

const DEFAULT_DRAFT: WorkPlanDraft = {
  title: "",
  description: "",
  startDate: "",
  endDate: "",
};

function WorkPlansPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [internships, setInternships] = useState<Internship[]>([]);
  const [usersById, setUsersById] = useState<
    Map<number, StudentSummary>
  >(new Map());
  const [workPlansByInternshipId, setWorkPlansByInternshipId] =
    useState<Map<number, Awaited<ReturnType<typeof getWorkPlanByInternshipId>> | null>>(
      new Map(),
    );
  const [formInternshipId, setFormInternshipId] = useState<
    number | null
  >(null);
  const [draft, setDraft] = useState<WorkPlanDraft>(
    DEFAULT_DRAFT,
  );
  const [submittingId, setSubmittingId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [internshipList] = await Promise.all([
        getMyCompanyInternships(),
      ]);

      const activeInternships = internshipList.filter(
        isActiveInternship,
      );

      const users = await loadUsersByIds(
        activeInternships.map(
          (internship) => internship.studentId,
        ),
      );

      const workPlanEntries = await Promise.all(
        activeInternships.map(async (internship) => {
          try {
            const workPlan = await getWorkPlanByInternshipId(
              internship.id,
            );
            return [internship.id, workPlan] as const;
          } catch (workPlanError) {
            const message = toErrorMessage(
              workPlanError,
              "Không thể tải kế hoạch thực tập.",
            );

            if (
              message.toLowerCase().includes("not found") ||
              message.toLowerCase().includes("work plan not found")
            ) {
              return [internship.id, null] as const;
            }

            throw workPlanError;
          }
        }),
      );

      setInternships(activeInternships);
      setUsersById(users);
      setWorkPlansByInternshipId(new Map(workPlanEntries));
    } catch (loadError) {
      console.error(
        "Failed to load work plans page:",
        loadError,
      );
      setError(
        toErrorMessage(
          loadError,
          "Không thể tải danh sách kế hoạch thực tập.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  const internshipsWithoutWorkPlan = useMemo(
    () =>
      internships.filter(
        (internship) =>
          !workPlansByInternshipId.get(internship.id),
      ).length,
    [internships, workPlansByInternshipId],
  );

  async function handleSubmit(
    internshipId: number,
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!draft.title.trim() || !draft.startDate || !draft.endDate) {
      setError(
        "Vui lòng nhập tiêu đề, ngày bắt đầu và ngày kết thúc cho kế hoạch thực tập.",
      );
      return;
    }

    setSubmittingId(internshipId);
    setError("");

    const payload: WorkPlanRequest = {
      title: draft.title.trim(),
      description: draft.description.trim() || null,
      startDate: draft.startDate,
      endDate: draft.endDate,
    };

    try {
      const workPlan = await createWorkPlan(
        internshipId,
        payload,
      );

      setWorkPlansByInternshipId((current) => {
        const next = new Map(current);
        next.set(internshipId, workPlan);
        return next;
      });
      setFormInternshipId(null);
      setDraft(DEFAULT_DRAFT);
    } catch (submitError) {
      console.error(
        "Failed to create work plan:",
        submitError,
      );
      setError(
        toErrorMessage(
          submitError,
          "Không thể tạo kế hoạch thực tập.",
        ),
      );
    } finally {
      setSubmittingId(null);
    }
  }

  if (loading) {
    return (
      <div className="container-fluid px-0">
        <LoadingState message="Đang tải kế hoạch thực tập..." />
      </div>
    );
  }

  return (
    <div className="container-fluid px-0">
      <PageHeader
        title="Kế hoạch thực tập"
        subtitle={`Quản lý kế hoạch thực tập cho các internship đang hoạt động. Còn ${internshipsWithoutWorkPlan} internship chưa có kế hoạch.`}
      />

      {error ? (
        <div className="alert alert-danger shadow-sm rounded-3 border-0">
          <i className="bi bi-exclamation-octagon me-2" />
          {error}
        </div>
      ) : null}

      {internships.length === 0 ? (
        <EmptyState
          title="Chưa có internship đang hoạt động"
          description="Khi doanh nghiệp có thực tập sinh đang ở trạng thái IN_PROGRESS, bạn có thể tạo kế hoạch làm việc tại đây."
          icon="bi-diagram-3"
        />
      ) : (
        <div className="row g-4">
          {internships.map((internship) => {
            const workPlan =
              workPlansByInternshipId.get(internship.id) ?? null;

            return (
              <div
                className="col-12 col-xl-6"
                key={internship.id}
              >
                <div className="card border-0 shadow-sm rounded-3 h-100">
                  <div className="card-body p-4">
                    <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-3">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <h2 className="h5 mb-0">
                            {internship.position}
                          </h2>
                          <StatusBadge status={internship.status} />
                        </div>
                        <p className="text-secondary mb-1">
                          Internship #{internship.id}
                        </p>
                        <p className="text-secondary mb-0">
                          Sinh viên:{" "}
                          {findUserLabel(
                            usersById,
                            internship.studentId,
                          )}
                        </p>
                      </div>

                      {!workPlan ? (
                        <button
                          type="button"
                          className="btn btn-primary rounded-pill align-self-start"
                          onClick={() => {
                            setFormInternshipId(
                              formInternshipId === internship.id
                                ? null
                                : internship.id,
                            );
                            setDraft(DEFAULT_DRAFT);
                          }}
                        >
                          <i className="bi bi-plus-lg me-2" />
                          Create Work Plan
                        </button>
                      ) : null}
                    </div>

                    <div className="row g-3 mb-3">
                      <div className="col-12 col-lg-6">
                        <div className="p-3 bg-body-tertiary rounded-3 h-100">
                          <p className="small text-uppercase text-secondary fw-semibold mb-2">
                            Thời gian thực tập
                          </p>
                          <p className="mb-0">
                            {formatDateRange(
                              internship.startDate,
                              internship.endDate,
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="col-12 col-lg-6">
                        <div className="p-3 bg-body-tertiary rounded-3 h-100">
                          <p className="small text-uppercase text-secondary fw-semibold mb-2">
                            Mô tả internship
                          </p>
                          <p className="mb-0">
                            {internship.description ||
                              "Chưa có mô tả."}
                          </p>
                        </div>
                      </div>
                    </div>

                    {workPlan ? (
                      <div className="border rounded-3 p-3 bg-success-subtle">
                        <div className="d-flex align-items-center gap-2 mb-2">
                          <i className="bi bi-check2-circle text-success" />
                          <p className="fw-semibold mb-0">
                            {workPlan.title}
                          </p>
                        </div>
                        <p className="text-secondary mb-2">
                          {workPlan.description ||
                            "Chưa có mô tả kế hoạch."}
                        </p>
                        <p className="mb-0 small">
                          {formatDate(workPlan.startDate)} -{" "}
                          {formatDate(workPlan.endDate)}
                        </p>
                      </div>
                    ) : (
                      <div className="border rounded-3 p-3 bg-warning-subtle">
                        <p className="mb-0">
                          Chưa có kế hoạch thực tập cho internship
                          này.
                        </p>
                      </div>
                    )}

                    {formInternshipId === internship.id &&
                    !workPlan ? (
                      <form
                        className="mt-4 border-top pt-4"
                        onSubmit={(event) =>
                          void handleSubmit(
                            internship.id,
                            event,
                          )
                        }
                      >
                        <div className="row g-3">
                          <div className="col-12">
                            <label className="form-label fw-semibold">
                              Tiêu đề kế hoạch
                            </label>
                            <input
                              type="text"
                              className="form-control rounded-3"
                              value={draft.title}
                              onChange={(event) =>
                                setDraft((current) => ({
                                  ...current,
                                  title: event.target.value,
                                }))
                              }
                              disabled={
                                submittingId === internship.id
                              }
                            />
                          </div>
                          <div className="col-12">
                            <label className="form-label fw-semibold">
                              Mô tả
                            </label>
                            <textarea
                              className="form-control rounded-3"
                              rows={4}
                              value={draft.description}
                              onChange={(event) =>
                                setDraft((current) => ({
                                  ...current,
                                  description:
                                    event.target.value,
                                }))
                              }
                              disabled={
                                submittingId === internship.id
                              }
                            />
                          </div>
                          <div className="col-12 col-lg-6">
                            <label className="form-label fw-semibold">
                              Ngày bắt đầu
                            </label>
                            <input
                              type="date"
                              className="form-control rounded-3"
                              value={draft.startDate}
                              onChange={(event) =>
                                setDraft((current) => ({
                                  ...current,
                                  startDate: event.target.value,
                                }))
                              }
                              disabled={
                                submittingId === internship.id
                              }
                            />
                          </div>
                          <div className="col-12 col-lg-6">
                            <label className="form-label fw-semibold">
                              Ngày kết thúc
                            </label>
                            <input
                              type="date"
                              className="form-control rounded-3"
                              value={draft.endDate}
                              onChange={(event) =>
                                setDraft((current) => ({
                                  ...current,
                                  endDate: event.target.value,
                                }))
                              }
                              disabled={
                                submittingId === internship.id
                              }
                            />
                          </div>
                        </div>

                        <div className="d-flex flex-wrap justify-content-end gap-2 mt-3">
                          <button
                            type="button"
                            className="btn btn-outline-secondary rounded-pill"
                            onClick={() => {
                              setFormInternshipId(null);
                              setDraft(DEFAULT_DRAFT);
                            }}
                            disabled={
                              submittingId === internship.id
                            }
                          >
                            Hủy
                          </button>
                          <button
                            type="submit"
                            className="btn btn-primary rounded-pill"
                            disabled={
                              submittingId === internship.id
                            }
                          >
                            {submittingId === internship.id
                              ? "Đang tạo..."
                              : "Lưu kế hoạch"}
                          </button>
                        </div>
                      </form>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default WorkPlansPage;
