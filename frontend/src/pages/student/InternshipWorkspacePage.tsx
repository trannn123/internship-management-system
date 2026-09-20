import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getEvaluationSummary } from "../../api/evaluation-api";
import {
  createInternshipLog,
  getInternshipById,
  getMyInternships,
  getStudentInternshipLogs,
  getTasksByWorkPlanId,
  getWorkPlanByInternshipId,
  updateInternshipTaskStatus,
} from "../../api/internship-api";
import { getInternshipRegistrationById } from "../../api/internship-registration-api";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import type {
  EvaluationSummary,
  Internship,
  InternshipLog,
  InternshipLogRequest,
  InternshipRegistration,
  Task,
  TaskStatus,
  WorkPlan,
} from "../../types";

type WorkspaceTab = "work-plan" | "tasks" | "logs" | "evaluation";

const TASK_PROGRESS_ORDER: TaskStatus[] = [
  "TODO",
  "IN_PROGRESS",
  "COMPLETED",
];

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

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function getNextTaskStatus(status: TaskStatus): TaskStatus | null {
  const index = TASK_PROGRESS_ORDER.indexOf(status);

  if (index === -1 || index === TASK_PROGRESS_ORDER.length - 1) {
    return null;
  }

  return TASK_PROGRESS_ORDER[index + 1];
}

function InternshipWorkspacePage() {
  const { id } = useParams();
  const referenceId = Number(id);

  const [activeTab, setActiveTab] = useState<WorkspaceTab>("work-plan");
  const [registration, setRegistration] = useState<InternshipRegistration | null>(null);
  const [internship, setInternship] = useState<Internship | null>(null);
  const [workPlan, setWorkPlan] = useState<WorkPlan | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<InternshipLog[]>([]);
  const [evaluationSummary, setEvaluationSummary] =
    useState<EvaluationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [taskBusyId, setTaskBusyId] = useState<number | null>(null);
  const [logForm, setLogForm] = useState<InternshipLogRequest>({
    logDate: "",
    content: "",
    result: "",
    note: "",
  });
  const [logErrors, setLogErrors] = useState<Partial<Record<keyof InternshipLogRequest, string>>>({});
  const [logSubmitting, setLogSubmitting] = useState(false);
  const [logFeedback, setLogFeedback] = useState("");

  useEffect(() => {
    async function resolveInternship(idValue: number) {
      try {
        const internshipById = await getInternshipById(idValue);

        return {
          internship: internshipById,
          registration: internshipById.registrationId
            ? await getInternshipRegistrationById(internshipById.registrationId)
            : null,
        };
      } catch {
        const [registrationData, internships] = await Promise.all([
          getInternshipRegistrationById(idValue),
          getMyInternships(),
        ]);

        const matchedInternship =
          internships.find(
            (candidate) => candidate.registrationId === registrationData.id,
          ) ?? null;

        return {
          internship: matchedInternship,
          registration: registrationData,
        };
      }
    }

    async function loadWorkspace() {
      if (!Number.isFinite(referenceId) || referenceId <= 0) {
        setError("Mã workspace không hợp lệ.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setLogFeedback("");

      try {
        const internshipData = await resolveInternship(referenceId);
        setInternship(internshipData.internship);
        setRegistration(internshipData.registration);

        if (!internshipData.internship) {
          setWorkPlan(null);
          setTasks([]);
          setLogs([]);
          setEvaluationSummary(null);
          return;
        }

        const internshipId = internshipData.internship.id;

        let workPlanData: WorkPlan | null = null;

        try {
          workPlanData = await getWorkPlanByInternshipId(internshipId);
          setWorkPlan(workPlanData);
        } catch (workPlanError) {
          console.error("Failed to load work plan:", workPlanError);
          setWorkPlan(null);
        }

        if (workPlanData) {
          try {
            const taskData = await getTasksByWorkPlanId(workPlanData.id);
            setTasks(taskData);
          } catch (taskError) {
            console.error("Failed to load tasks:", taskError);
            setTasks([]);
          }
        } else {
          setTasks([]);
        }

        try {
          const logData = await getStudentInternshipLogs(internshipId);
          setLogs(
            [...logData].sort(
              (left, right) =>
                new Date(right.logDate).getTime() - new Date(left.logDate).getTime(),
            ),
          );
        } catch (logError) {
          console.error("Failed to load internship logs:", logError);
          setLogs([]);
        }

        try {
          const summaryData = await getEvaluationSummary(internshipId);
          setEvaluationSummary(summaryData);
        } catch (summaryError) {
          console.error("Failed to load evaluation summary:", summaryError);
          setEvaluationSummary(null);
        }
      } catch (loadError) {
        console.error("Failed to load internship workspace:", loadError);
        setError(
          getErrorMessage(loadError, "Không thể tải workspace thực tập."),
        );
      } finally {
        setLoading(false);
      }
    }

    void loadWorkspace();
  }, [referenceId]);

  const tabs = useMemo(
    () => [
      { key: "work-plan" as const, label: "Kế hoạch thực tập", icon: "bi-diagram-3" },
      { key: "tasks" as const, label: "Công việc", icon: "bi-list-check" },
      { key: "logs" as const, label: "Nhật ký thực tập", icon: "bi-journal-text" },
      { key: "evaluation" as const, label: "Kết quả đánh giá", icon: "bi-award" },
    ],
    [],
  );

  function validateLogForm() {
    const nextErrors: Partial<Record<keyof InternshipLogRequest, string>> = {};

    if (!logForm.logDate) {
      nextErrors.logDate = "Vui lòng chọn ngày ghi log.";
    }

    if (!logForm.content.trim()) {
      nextErrors.content = "Vui lòng nhập nội dung công việc.";
    } else if (logForm.content.trim().length > 2000) {
      nextErrors.content = "Nội dung không được vượt quá 2000 ký tự.";
    }

    if ((logForm.result ?? "").trim().length > 2000) {
      nextErrors.result = "Kết quả không được vượt quá 2000 ký tự.";
    }

    if ((logForm.note ?? "").trim().length > 1000) {
      nextErrors.note = "Ghi chú không được vượt quá 1000 ký tự.";
    }

    setLogErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleTaskStatusUpdate(task: Task) {
    const nextStatus = getNextTaskStatus(task.status);

    if (!nextStatus || taskBusyId !== null) {
      return;
    }

    setTaskBusyId(task.id);
    setError("");

    try {
      const updatedTask = await updateInternshipTaskStatus(task.id, {
        status: nextStatus,
      });

      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === updatedTask.id ? updatedTask : currentTask,
        ),
      );
    } catch (updateError) {
      console.error("Failed to update task status:", updateError);
      setError(
        getErrorMessage(updateError, "Không thể cập nhật trạng thái công việc."),
      );
    } finally {
      setTaskBusyId(null);
    }
  }

  async function handleLogSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!internship || logSubmitting || !validateLogForm()) {
      return;
    }

    setLogSubmitting(true);
    setLogFeedback("");
    setError("");

    try {
      const createdLog = await createInternshipLog(internship.id, {
        logDate: logForm.logDate,
        content: logForm.content.trim(),
        result: logForm.result?.trim() || null,
        note: logForm.note?.trim() || null,
      });

      setLogs((currentLogs) =>
        [createdLog, ...currentLogs].sort(
          (left, right) =>
            new Date(right.logDate).getTime() - new Date(left.logDate).getTime(),
        ),
      );
      setLogForm({
        logDate: "",
        content: "",
        result: "",
        note: "",
      });
      setLogErrors({});
      setLogFeedback("Đã tạo nhật ký thực tập thành công.");
    } catch (submitError) {
      console.error("Failed to create internship log:", submitError);
      setError(
        getErrorMessage(submitError, "Không thể tạo nhật ký thực tập."),
      );
    } finally {
      setLogSubmitting(false);
    }
  }

  if (loading) {
    return <LoadingState message="Đang tải internship workspace..." />;
  }

  if (error && !registration && !internship) {
    return (
      <EmptyState
        title="Không thể tải workspace"
        description={error}
        icon="bi-exclamation-triangle"
      />
    );
  }

  if (!registration && !internship) {
    return (
      <EmptyState
        title="Không tìm thấy workspace"
        description="Hồ sơ hoặc kỳ thực tập này không tồn tại hoặc bạn không có quyền truy cập."
        icon="bi-inbox"
      />
    );
  }

  return (
    <div className="container-fluid px-0">
      <PageHeader
        title={internship?.position ?? `Registration #${registration?.id ?? referenceId}`}
        subtitle={
          internship
            ? `Theo dõi kế hoạch, công việc, nhật ký và kết quả đánh giá cho kỳ thực tập #${internship.id}.`
            : "Workspace sẽ đầy đủ khi hồ sơ được duyệt và chuyển sang giai đoạn thực tập."
        }
        actions={(
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {internship ? (
              <StatusBadge status={internship.status} />
            ) : registration ? (
              <StatusBadge status={registration.status} />
            ) : null}
          </div>
        )}
      />

      {error ? (
        <div className="alert alert-danger border-0 shadow-sm rounded-3" role="alert">
          <i className="bi bi-exclamation-octagon me-2" />
          {error}
        </div>
      ) : null}

      <div className="card border-0 shadow-sm rounded-3 mb-4">
        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-md-4">
              <div className="p-3 rounded-3 bg-body-tertiary h-100">
                <p className="small text-secondary text-uppercase fw-semibold mb-1">
                  Mã hồ sơ
                </p>
                <p className="mb-0 fw-semibold">{registration?.id ?? "—"}</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3 rounded-3 bg-body-tertiary h-100">
                <p className="small text-secondary text-uppercase fw-semibold mb-1">
                  Internship ID
                </p>
                <p className="mb-0 fw-semibold">{internship?.id ?? "Chưa tạo"}</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3 rounded-3 bg-body-tertiary h-100">
                <p className="small text-secondary text-uppercase fw-semibold mb-1">
                  Thời gian thực tập
                </p>
                <p className="mb-0 fw-semibold">
                  {internship
                    ? `${formatDate(internship.startDate)} - ${formatDate(internship.endDate)}`
                    : "Chưa khả dụng"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!internship ? (
        <EmptyState
          title="Workspace chưa sẵn sàng"
          description="Hồ sơ của bạn chưa chuyển sang IN_PROGRESS. Khi được duyệt đầy đủ, kế hoạch và nhật ký sẽ hiển thị tại đây."
          icon="bi-clock-history"
          action={(
            <Link
              className="btn btn-outline-primary rounded-pill"
              to="/student/registrations"
            >
              Quay lại danh sách đăng ký
            </Link>
          )}
        />
      ) : (
        <>
          <ul className="nav nav-pills gap-2 mb-4">
            {tabs.map((tab) => (
              <li className="nav-item" key={tab.key}>
                <button
                  type="button"
                  className={`nav-link rounded-pill ${
                    activeTab === tab.key ? "active" : "bg-light text-dark"
                  }`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <i className={`bi ${tab.icon} me-2`} />
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>

          {activeTab === "work-plan" ? (
            workPlan ? (
              <div className="card border-0 shadow-sm rounded-3">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
                    <div>
                      <h2 className="h5 mb-1">{workPlan.title}</h2>
                      <p className="text-secondary mb-0">
                        Kế hoạch thực tập do doanh nghiệp xây dựng cho bạn.
                      </p>
                    </div>
                    <span className="icon-circle bg-primary-subtle text-primary">
                      <i className="bi bi-diagram-3 fs-5" />
                    </span>
                  </div>

                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <div className="p-3 rounded-3 bg-body-tertiary h-100">
                        <p className="small text-secondary text-uppercase fw-semibold mb-1">
                          Bắt đầu
                        </p>
                        <p className="mb-0">{formatDate(workPlan.startDate)}</p>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 rounded-3 bg-body-tertiary h-100">
                        <p className="small text-secondary text-uppercase fw-semibold mb-1">
                          Kết thúc
                        </p>
                        <p className="mb-0">{formatDate(workPlan.endDate)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3 p-4 bg-light-subtle">
                    <p className="small text-secondary text-uppercase fw-semibold mb-2">
                      Mô tả
                    </p>
                    <p className="mb-0">{workPlan.description ?? "Chưa có mô tả kế hoạch."}</p>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                title="Chưa có Work Plan"
                description="Doanh nghiệp chưa tạo kế hoạch thực tập cho kỳ thực tập này."
                icon="bi-diagram-3"
              />
            )
          ) : null}

          {activeTab === "tasks" ? (
            tasks.length > 0 ? (
              <div className="card border-0 shadow-sm rounded-3">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center gap-3 mb-4">
                    <div>
                      <h2 className="h5 mb-1">Công việc</h2>
                      <p className="text-secondary mb-0">
                        Chỉ cho phép cập nhật tiến độ theo chiều tiến lên.
                      </p>
                    </div>
                    <span className="badge text-bg-light">
                      {tasks.filter((task) => task.status === "COMPLETED").length}/{tasks.length} hoàn thành
                    </span>
                  </div>

                  <div className="d-flex flex-column gap-3">
                    {tasks.map((task) => {
                      const nextStatus = getNextTaskStatus(task.status);
                      const isBusy = taskBusyId === task.id;

                      return (
                        <div className="border rounded-3 p-3" key={task.id}>
                          <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-3">
                            <div>
                              <h3 className="h6 mb-1">{task.title}</h3>
                              <p className="text-secondary mb-0">
                                {task.description ?? "Không có mô tả chi tiết."}
                              </p>
                            </div>
                            <StatusBadge status={task.status} />
                          </div>

                          <div className="row g-3 align-items-center">
                            <div className="col-md-7">
                              <small className="text-secondary d-block">
                                Bắt đầu: {formatDate(task.startDate)}
                              </small>
                              <small className="text-secondary d-block">
                                Hạn hoàn thành: {formatDate(task.dueDate)}
                              </small>
                            </div>
                            <div className="col-md-5 text-md-end">
                              {nextStatus ? (
                                <button
                                  type="button"
                                  className="btn btn-primary rounded-pill px-4"
                                  disabled={isBusy}
                                  onClick={() => {
                                    void handleTaskStatusUpdate(task);
                                  }}
                                >
                                  {isBusy ? (
                                    <>
                                      <span
                                        className="spinner-border spinner-border-sm me-2"
                                        aria-hidden="true"
                                      />
                                      Đang cập nhật...
                                    </>
                                  ) : nextStatus === "IN_PROGRESS" ? (
                                    "Bắt đầu công việc"
                                  ) : (
                                    "Đánh dấu hoàn thành"
                                  )}
                                </button>
                              ) : (
                                <span className="text-success fw-semibold">
                                  <i className="bi bi-check-circle me-2" />
                                  Đã hoàn thành
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                title="Chưa có task"
                description="Danh sách công việc sẽ xuất hiện sau khi doanh nghiệp thêm task vào work plan."
                icon="bi-list-check"
              />
            )
          ) : null}

          {activeTab === "logs" ? (
            <div className="row g-4">
              <div className="col-12 col-xl-5">
                <div className="card border-0 shadow-sm rounded-3">
                  <div className="card-body p-4">
                    <div className="d-flex align-items-center gap-3 mb-4">
                      <span className="icon-circle bg-info-subtle text-info">
                        <i className="bi bi-pencil-square fs-5" />
                      </span>
                      <div>
                        <h2 className="h5 mb-1">Nhật ký mới</h2>
                        <p className="text-secondary mb-0">
                          Cập nhật công việc đã làm trong ngày.
                        </p>
                      </div>
                    </div>

                    {logFeedback ? (
                      <div className="alert alert-success rounded-3" role="alert">
                        <i className="bi bi-check-circle me-2" />
                        {logFeedback}
                      </div>
                    ) : null}

                    <form onSubmit={handleLogSubmit} noValidate>
                      <div className="mb-3">
                        <label className="form-label" htmlFor="logDate">
                          Ngày ghi log
                        </label>
                        <input
                          id="logDate"
                          type="date"
                          className={`form-control ${logErrors.logDate ? "is-invalid" : ""}`}
                          value={logForm.logDate}
                          onChange={(event) =>
                            setLogForm((current) => ({
                              ...current,
                              logDate: event.target.value,
                            }))
                          }
                          max={new Date().toISOString().slice(0, 10)}
                        />
                        {logErrors.logDate ? (
                          <div className="invalid-feedback">{logErrors.logDate}</div>
                        ) : null}
                      </div>

                      <div className="mb-3">
                        <label className="form-label" htmlFor="content">
                          Nội dung công việc
                        </label>
                        <textarea
                          id="content"
                          className={`form-control ${logErrors.content ? "is-invalid" : ""}`}
                          rows={4}
                          value={logForm.content}
                          onChange={(event) =>
                            setLogForm((current) => ({
                              ...current,
                              content: event.target.value,
                            }))
                          }
                          placeholder="Mô tả những gì bạn đã thực hiện..."
                        />
                        {logErrors.content ? (
                          <div className="invalid-feedback">{logErrors.content}</div>
                        ) : null}
                      </div>

                      <div className="mb-3">
                        <label className="form-label" htmlFor="result">
                          Kết quả
                        </label>
                        <textarea
                          id="result"
                          className={`form-control ${logErrors.result ? "is-invalid" : ""}`}
                          rows={3}
                          value={logForm.result ?? ""}
                          onChange={(event) =>
                            setLogForm((current) => ({
                              ...current,
                              result: event.target.value,
                            }))
                          }
                          placeholder="Kết quả hoặc đầu ra đạt được..."
                        />
                        {logErrors.result ? (
                          <div className="invalid-feedback">{logErrors.result}</div>
                        ) : null}
                      </div>

                      <div className="mb-4">
                        <label className="form-label" htmlFor="note">
                          Ghi chú
                        </label>
                        <textarea
                          id="note"
                          className={`form-control ${logErrors.note ? "is-invalid" : ""}`}
                          rows={3}
                          value={logForm.note ?? ""}
                          onChange={(event) =>
                            setLogForm((current) => ({
                              ...current,
                              note: event.target.value,
                            }))
                          }
                          placeholder="Bổ sung khó khăn, hỗ trợ cần thiết hoặc ghi chú khác..."
                        />
                        {logErrors.note ? (
                          <div className="invalid-feedback">{logErrors.note}</div>
                        ) : null}
                      </div>

                      <button
                        type="submit"
                        className="btn btn-primary rounded-pill px-4"
                        disabled={logSubmitting}
                      >
                        {logSubmitting ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              aria-hidden="true"
                            />
                            Đang lưu...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-journal-plus me-2" />
                            Tạo log mới
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              <div className="col-12 col-xl-7">
                {logs.length > 0 ? (
                  <div className="card border-0 shadow-sm rounded-3">
                    <div className="card-body p-4">
                      <h2 className="h5 mb-3">Nhật ký thực tập</h2>
                      <div className="d-flex flex-column gap-3">
                        {logs.map((log) => (
                          <div className="border rounded-3 p-3" key={log.id}>
                            <div className="d-flex justify-content-between align-items-center gap-3 mb-2">
                              <span className="fw-semibold">{formatDate(log.logDate)}</span>
                              <span className="badge text-bg-light">#{log.id}</span>
                            </div>
                            <p className="mb-2">{log.content}</p>
                            <p className="mb-2 text-secondary">
                              <strong>Kết quả:</strong> {log.result ?? "Chưa cập nhật"}
                            </p>
                            <p className="mb-0 text-secondary">
                              <strong>Ghi chú:</strong> {log.note ?? "Không có"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <EmptyState
                    title="Chưa có internship log"
                    description="Hãy tạo bản ghi đầu tiên để theo dõi tiến độ thực tập mỗi ngày."
                    icon="bi-journal-text"
                  />
                )}
              </div>
            </div>
          ) : null}

          {activeTab === "evaluation" ? (
            evaluationSummary ? (
              <div className="card border-0 shadow-sm rounded-3">
                <div className="card-body p-4">
                  <div className="row g-4">
                    <div className="col-md-4">
                      <div className="p-4 rounded-3 bg-success-subtle h-100">
                        <p className="small text-secondary text-uppercase fw-semibold mb-1">
                          Company Evaluation
                        </p>
                        <h2 className="h3 mb-2">{evaluationSummary.companyScore ?? "—"}</h2>
                        <p className="mb-0 text-secondary">
                          {evaluationSummary.companyComment ?? "Chưa có nhận xét từ doanh nghiệp."}
                        </p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-4 rounded-3 bg-info-subtle h-100">
                        <p className="small text-secondary text-uppercase fw-semibold mb-1">
                          Lecturer Evaluation
                        </p>
                        <h2 className="h3 mb-2">{evaluationSummary.lecturerScore ?? "—"}</h2>
                        <p className="mb-0 text-secondary">
                          {evaluationSummary.lecturerComment ?? "Chưa có nhận xét từ giảng viên."}
                        </p>
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="p-4 rounded-3 bg-primary-subtle h-100">
                        <p className="small text-secondary text-uppercase fw-semibold mb-1">
                          Final Score
                        </p>
                        <h2 className="h3 mb-2">{evaluationSummary.finalScore ?? "—"}</h2>
                        <p className="mb-0 text-secondary">
                          Điểm tổng hợp cuối kỳ thực tập.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                title="Chưa đánh giá"
                description="Kết quả đánh giá sẽ hiển thị tại đây khi doanh nghiệp hoặc giảng viên hoàn tất chấm điểm."
                icon="bi-award"
              />
            )
          ) : null}
        </>
      )}
    </div>
  );
}

export default InternshipWorkspacePage;
