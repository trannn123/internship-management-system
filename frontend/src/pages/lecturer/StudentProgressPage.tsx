import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  createLecturerEvaluation,
  getEvaluationExistence,
  getLecturerEvaluation,
} from "../../api/evaluation-api";
import {
  getInternshipById,
  getInternshipLogsForLecturer,
  getMyInternships,
  getTasksByWorkPlanId,
  getWorkPlanByInternshipId,
} from "../../api/internship-api";
import { getInternshipOpportunityById } from "../../api/internship-opportunity-api";
import { getInternshipPeriodById } from "../../api/internship-period-api";
import {
  completeInternshipRegistration,
  getInternshipRegistrationById,
} from "../../api/internship-registration-api";
import { getCompanyProfileById, getStudentProfileById } from "../../api/user-api";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import type {
  CompanySummary,
  Internship,
  InternshipLog,
  InternshipOpportunity,
  InternshipPeriod,
  InternshipRegistration,
  LecturerEvaluation,
  StudentSummary,
  Task,
  WorkPlan,
} from "../../types";
import {
  formatDate,
  formatDateRange,
  formatDateTime,
  getCompanyDisplayName,
  getDisplayName,
  getErrorMessage,
  isNotFoundError,
} from "./lecturer-helpers";

interface ProgressState {
  internship: Internship;
  registration: InternshipRegistration | null;
  period: InternshipPeriod | null;
  opportunity: InternshipOpportunity | null;
  workPlan: WorkPlan | null;
  tasks: Task[];
  logs: InternshipLog[];
  student: StudentSummary | null;
  company: CompanySummary | null;
  evaluation: LecturerEvaluation | null;
}

function StudentProgressPage() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState("");
  const [comment, setComment] = useState("");
  const [progress, setProgress] = useState<ProgressState | null>(null);

  useEffect(() => {
    async function loadProgress() {
      const resourceId = Number(id);

      if (!Number.isFinite(resourceId) || resourceId <= 0) {
        setError("Mã thực tập không hợp lệ.");
        setLoading(false);
        return;
      }

      try {
        const internships = await getMyInternships();
        let internship = internships.find((item) => item.id === resourceId) ?? null;
        let registration: InternshipRegistration | null = null;

        if (internship?.registrationId != null) {
          registration = await getInternshipRegistrationById(internship.registrationId);
        }

        if (!internship) {
          registration = await getInternshipRegistrationById(resourceId);
          internship =
            internships.find((item) => item.registrationId === registration?.id) ??
            (await getInternshipById(resourceId));
        }

        if (!registration && internship.registrationId != null) {
          registration = await getInternshipRegistrationById(internship.registrationId);
        }

        const [
          period,
          opportunity,
          student,
          company,
          workPlan,
          logs,
          evaluation,
        ] = await Promise.all([
          registration
            ? getInternshipPeriodById(registration.periodId)
            : Promise.resolve(null),
          registration
            ? getInternshipOpportunityById(registration.opportunityId)
            : Promise.resolve(null),
          getStudentProfileById(internship.studentId),
          internship.companyId != null
            ? getCompanyProfileById(internship.companyId)
            : Promise.resolve(null),
          getWorkPlanByInternshipId(internship.id).catch((loadError: unknown) => {
            if (isNotFoundError(loadError)) {
              return null;
            }

            throw loadError;
          }),
          getInternshipLogsForLecturer(internship.id),
          getLecturerEvaluation(internship.id).catch((loadError: unknown) => {
            if (isNotFoundError(loadError)) {
              return null;
            }

            throw loadError;
          }),
        ]);

        const tasks = workPlan
          ? await getTasksByWorkPlanId(workPlan.id)
          : [];

        setProgress({
          internship,
          registration,
          period,
          opportunity,
          workPlan,
          tasks,
          logs,
          student,
          company,
          evaluation,
        });

        if (evaluation) {
          setScore(String(evaluation.score));
          setComment(evaluation.comment ?? "");
        }
      } catch (loadError) {
        console.error("Failed to load student progress for lecturer:", loadError);
        setError(getErrorMessage(loadError, "Không thể tải tiến độ thực tập."));
      } finally {
        setLoading(false);
      }
    }

    loadProgress();
  }, [id]);

  async function handleSubmitEvaluation(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!progress || progress.evaluation) {
      return;
    }

    const parsedScore = Number(score);
    if (!Number.isFinite(parsedScore) || parsedScore < 0 || parsedScore > 10) {
      setError("Điểm đánh giá phải nằm trong khoảng từ 0 đến 10.");
      return;
    }

    setSubmitting(true);
    setError("");
    setFeedback("");

    try {
      const evaluation = await createLecturerEvaluation(progress.internship.id, {
        score: parsedScore,
        comment: comment.trim() || null,
      });

      // Once both the company and lecturer evaluations exist, finalize the
      // registration so its status (and the internship status) move to
      // COMPLETED in one consistent transition visible to every role.
      let updatedInternship = progress.internship;
      const existence = await getEvaluationExistence(progress.internship.id);
      if (
        existence.companyEvaluationExists &&
        existence.lecturerEvaluationExists &&
        progress.internship.registrationId
      ) {
        try {
          await completeInternshipRegistration(
            progress.internship.registrationId,
          );
          updatedInternship = {
            ...progress.internship,
            status: "COMPLETED_LECTURER",
          };
        } catch (completeError) {
          console.error(
            "Failed to finalize internship registration:",
            completeError,
          );
        }
      }

      setProgress((currentProgress) =>
        currentProgress
          ? {
              ...currentProgress,
              internship: updatedInternship,
              evaluation,
            }
          : currentProgress,
      );
      setFeedback("Đã lưu đánh giá giảng viên thành công.");
    } catch (submitError) {
      console.error("Failed to create lecturer evaluation:", submitError);
      setError(getErrorMessage(submitError, "Không thể lưu đánh giá."));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <LoadingState message="Đang tải tiến độ sinh viên..." />;
  }

  if (error && !progress) {
    return (
      <div className="d-flex flex-column gap-4">
        <PageHeader
          title="Tiến độ sinh viên"
          subtitle="Không thể tải chi tiết tiến độ thực tập."
        />
        <div className="alert alert-danger shadow-sm border-0 rounded-3 mb-0">
          <i className="bi bi-exclamation-triangle me-2" />
          {error}
        </div>
      </div>
    );
  }

  if (!progress) {
    return (
      <EmptyState
        title="Không tìm thấy dữ liệu thực tập"
        description="Bản ghi thực tập có thể đã bị xóa hoặc bạn không có quyền truy cập."
        icon="bi-folder-x"
      />
    );
  }

  return (
    <div className="d-flex flex-column gap-4">
      <PageHeader
        title={getDisplayName(progress.student, `Sinh viên #${progress.internship.studentId}`)}
        subtitle="Theo dõi thông tin thực tập, kế hoạch công việc, nhật ký và đánh giá cuối kỳ."
        actions={
          <Link to="/lecturer/students" className="btn btn-outline-primary">
            <i className="bi bi-arrow-left me-2" />
            Quay lại danh sách
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

      <section className="card border-0 shadow-sm rounded-3">
        <div className="card-body">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">
            <div>
              <h2 className="h5 mb-1">Thông tin thực tập</h2>
              <p className="text-secondary mb-0">
                Tổng quan về sinh viên, doanh nghiệp và giai đoạn thực tập hiện tại.
              </p>
            </div>
            <StatusBadge status={progress.registration?.status ?? progress.internship.status} />
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-6 col-xl-3">
              <div className="bg-body-tertiary rounded-3 p-3 h-100">
                <div className="text-secondary small mb-1">Sinh viên</div>
                <div className="fw-semibold">
                  {getDisplayName(progress.student, `Sinh viên #${progress.internship.studentId}`)}
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-xl-3">
              <div className="bg-body-tertiary rounded-3 p-3 h-100">
                <div className="text-secondary small mb-1">Doanh nghiệp</div>
                <div className="fw-semibold">
                  {getCompanyDisplayName(
                    progress.company,
                    progress.internship.companyId != null
                      ? `Doanh nghiệp #${progress.internship.companyId}`
                      : "Chưa gán doanh nghiệp",
                  )}
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-xl-3">
              <div className="bg-body-tertiary rounded-3 p-3 h-100">
                <div className="text-secondary small mb-1">Vị trí</div>
                <div className="fw-semibold">
                  {progress.internship.position || progress.opportunity?.position || "—"}
                </div>
              </div>
            </div>
            <div className="col-12 col-md-6 col-xl-3">
              <div className="bg-body-tertiary rounded-3 p-3 h-100">
                <div className="text-secondary small mb-1">Thời gian</div>
                <div className="fw-semibold">
                  {formatDateRange(
                    progress.internship.startDate,
                    progress.internship.endDate,
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="row g-3 mt-1">
            <div className="col-12 col-lg-6">
              <div className="bg-body-tertiary rounded-3 p-3 h-100">
                <div className="text-secondary small mb-1">Đợt thực tập</div>
                <div className="fw-semibold">{progress.period?.name ?? "—"}</div>
                <small className="text-secondary">
                  Đăng ký: {formatDate(progress.registration?.registeredAt ?? null)}
                </small>
              </div>
            </div>
            <div className="col-12 col-lg-6">
              <div className="bg-body-tertiary rounded-3 p-3 h-100">
                <div className="text-secondary small mb-1">Mô tả</div>
                <div>{progress.internship.description ?? "Chưa có mô tả chi tiết."}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="card border-0 shadow-sm rounded-3">
        <div className="card-body">
          <div className="mb-4">
            <h2 className="h5 mb-1">Kế hoạch công việc</h2>
            <p className="text-secondary mb-0">
              Theo dõi kế hoạch do doanh nghiệp tạo và tiến độ hoàn thành từng đầu việc.
            </p>
          </div>

          {progress.workPlan ? (
            <div className="d-flex flex-column gap-3">
              <div className="bg-body-tertiary rounded-3 p-3">
                <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
                  <div>
                    <h3 className="h6 mb-1">{progress.workPlan.title}</h3>
                    <p className="mb-2">
                      {progress.workPlan.description ?? "Chưa có mô tả kế hoạch."}
                    </p>
                  </div>
                  <div className="text-secondary small">
                    {formatDateRange(
                      progress.workPlan.startDate,
                      progress.workPlan.endDate,
                    )}
                  </div>
                </div>
              </div>

              {progress.tasks.length === 0 ? (
                <EmptyState
                  title="Chưa có công việc trong kế hoạch"
                  description="Doanh nghiệp chưa tạo đầu việc chi tiết cho kế hoạch này."
                  icon="bi-list-task"
                />
              ) : (
                <div className="list-group list-group-flush">
                  {progress.tasks.map((task) => (
                    <div
                      key={task.id}
                      className="list-group-item px-0 py-3 border-bottom"
                    >
                      <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
                        <div>
                          <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                            <h3 className="h6 mb-0">{task.title}</h3>
                            <StatusBadge status={task.status} />
                          </div>
                          <p className="mb-1">
                            {task.description ?? "Không có mô tả chi tiết."}
                          </p>
                          <small className="text-secondary">
                            {formatDateRange(task.startDate, task.dueDate)}
                          </small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              title="Chưa có kế hoạch công việc"
              description="Sinh viên này chưa được doanh nghiệp tạo work plan."
              icon="bi-diagram-3"
            />
          )}
        </div>
      </section>

      <section className="card border-0 shadow-sm rounded-3">
        <div className="card-body">
          <div className="mb-4">
            <h2 className="h5 mb-1">Nhật ký thực tập</h2>
            <p className="text-secondary mb-0">
              Bạn có thể xem nhật ký cập nhật của sinh viên theo từng ngày làm việc.
            </p>
          </div>

          {progress.logs.length === 0 ? (
            <EmptyState
              title="Chưa có nhật ký thực tập"
              description="Sinh viên chưa ghi nhận nhật ký nào cho kỳ thực tập này."
              icon="bi-journal-text"
            />
          ) : (
            <div className="d-flex flex-column gap-3">
              {progress.logs.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-3 p-3 bg-body-tertiary"
                >
                  <div className="d-flex flex-column flex-lg-row justify-content-between gap-2 mb-2">
                    <div className="fw-semibold">
                      <i className="bi bi-calendar-event me-2 text-primary" />
                      {formatDate(log.logDate)}
                    </div>
                    <small className="text-secondary">
                      Cập nhật lúc: {formatDateTime(log.logDate)}
                    </small>
                  </div>
                  <div className="mb-2">
                    <div className="text-secondary small mb-1">Nội dung</div>
                    <div>{log.content}</div>
                  </div>
                  <div className="row g-3">
                    <div className="col-12 col-lg-6">
                      <div className="text-secondary small mb-1">Kết quả</div>
                      <div>{log.result ?? "Chưa cập nhật"}</div>
                    </div>
                    <div className="col-12 col-lg-6">
                      <div className="text-secondary small mb-1">Ghi chú</div>
                      <div>{log.note ?? "Không có"}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="card border-0 shadow-sm rounded-3">
        <div className="card-body">
          <div className="mb-4">
            <h2 className="h5 mb-1">Đánh giá giảng viên</h2>
            <p className="text-secondary mb-0">
              Chấm điểm từ 0 đến 10 và nhận xét cuối kỳ cho sinh viên.
            </p>
          </div>

          {progress.evaluation ? (
            <div className="bg-success-subtle rounded-3 p-4">
              <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
                <div>
                  <div className="d-flex align-items-center gap-2 flex-wrap mb-2">
                    <span className="badge text-bg-success">Đã đánh giá</span>
                    <span className="fw-semibold">
                      Điểm: {progress.evaluation.score}/10
                    </span>
                  </div>
                  <p className="mb-2">
                    {progress.evaluation.comment ?? "Không có nhận xét bổ sung."}
                  </p>
                  <small className="text-secondary">
                    Thời gian đánh giá: {formatDateTime(progress.evaluation.evaluatedAt)}
                  </small>
                </div>
                <i className="bi bi-clipboard-check fs-1 text-success" />
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitEvaluation} className="row g-3">
              <div className="col-12 col-md-4">
                <label htmlFor="lecturer-score" className="form-label fw-semibold">
                  Điểm số
                </label>
                <input
                  id="lecturer-score"
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  className="form-control"
                  value={score}
                  onChange={(event) => setScore(event.target.value)}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="col-12">
                <label htmlFor="lecturer-comment" className="form-label fw-semibold">
                  Nhận xét
                </label>
                <textarea
                  id="lecturer-comment"
                  className="form-control"
                  rows={5}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  disabled={submitting}
                  placeholder="Nhập nhận xét, góp ý hoặc đánh giá tổng quan."
                />
              </div>

              <div className="col-12">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        aria-hidden="true"
                      />
                      Đang lưu đánh giá...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-send-check me-2" />
                      Gửi đánh giá
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}

export default StudentProgressPage;
