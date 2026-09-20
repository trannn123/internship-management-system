import { useEffect, useMemo, useState } from "react";
import {
  createCompanyEvaluation,
  getCompanyEvaluation,
  getEvaluationExistence,
} from "../../api/evaluation-api";
import {
  completeInternshipByCompanyEvaluation,
} from "../../api/internship-registration-api";
import { getMyCompanyInternships } from "../../api/internship-api";
import DataTable, {
  type DataTableColumn,
} from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import type {
  CompanyEvaluation,
  CompanyEvaluationRequest,
  Internship,
} from "../../types";
import {
  findUserLabel,
  formatDate,
  isActiveInternship,
  isCompletedInternship,
  loadUsersByIds,
  toErrorMessage,
} from "./company-page-utils";

interface EvaluationDraft {
  score: string;
  comment: string;
}

interface EvaluationRow {
  internship: Internship;
  studentLabel: string;
  evaluation: CompanyEvaluation | null;
  hasEvaluation: boolean;
}

const DEFAULT_DRAFT: EvaluationDraft = {
  score: "",
  comment: "",
};

function EvaluationsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rows, setRows] = useState<EvaluationRow[]>([]);
  const [selectedInternshipId, setSelectedInternshipId] =
    useState<number | null>(null);
  const [draft, setDraft] = useState<EvaluationDraft>(
    DEFAULT_DRAFT,
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [internships] = await Promise.all([
        getMyCompanyInternships(),
      ]);

      const visibleInternships = internships.filter(
        (internship) =>
          isActiveInternship(internship) ||
          isCompletedInternship(internship),
      );
      const usersById = await loadUsersByIds(
        visibleInternships.map(
          (internship) => internship.studentId,
        ),
      );

      const nextRows = await Promise.all(
        visibleInternships.map(async (internship) => {
          const existence = await getEvaluationExistence(
            internship.id,
          );

          let evaluation: CompanyEvaluation | null = null;
          if (existence.companyEvaluationExists) {
            evaluation = await getCompanyEvaluation(
              internship.id,
            );
          }

          return {
            internship,
            studentLabel: findUserLabel(
              usersById,
              internship.studentId,
            ),
            evaluation,
            hasEvaluation: existence.companyEvaluationExists,
          } satisfies EvaluationRow;
        }),
      );

      setRows(nextRows);
    } catch (loadError) {
      console.error(
        "Failed to load evaluations page:",
        loadError,
      );
      setError(
        toErrorMessage(
          loadError,
          "Không thể tải danh sách đánh giá.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  const selectedRow = useMemo(
    () =>
      rows.find(
        (row) => row.internship.id === selectedInternshipId,
      ) ?? null,
    [rows, selectedInternshipId],
  );

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedRow) {
      return;
    }

    const score = Number(draft.score);
    if (Number.isNaN(score) || score < 0 || score > 10) {
      setError("Điểm đánh giá phải nằm trong khoảng 0 đến 10.");
      return;
    }

    setSubmitting(true);
    setError("");

    const payload: CompanyEvaluationRequest = {
      score,
      comment: draft.comment.trim() || null,
    };

    try {
      const evaluation = await createCompanyEvaluation(
        selectedRow.internship.id,
        payload,
      );

      // Submitting the company evaluation immediately advances the
      // registration/internship status to COMPLETED_COMPANY so every role
      // (company, lecturer, student) sees the update right away.
      let updatedInternship = selectedRow.internship;
      if (selectedRow.internship.status === "IN_PROGRESS") {
        try {
          await completeInternshipByCompanyEvaluation(
            selectedRow.internship.id,
          );
          updatedInternship = {
            ...selectedRow.internship,
            status: "COMPLETED_COMPANY",
          };
        } catch (completeError) {
          console.error(
            "Failed to mark internship as completed by company:",
            completeError,
          );
        }
      }

      setRows((current) =>
        current.map((row) =>
          row.internship.id === selectedRow.internship.id
            ? {
                ...row,
                internship: updatedInternship,
                evaluation,
                hasEvaluation: true,
              }
            : row,
        ),
      );
      setSelectedInternshipId(null);
      setDraft(DEFAULT_DRAFT);
    } catch (submitError) {
      console.error(
        "Failed to create company evaluation:",
        submitError,
      );
      setError(
        toErrorMessage(
          submitError,
          "Không thể tạo đánh giá doanh nghiệp.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  const columns = useMemo<
    DataTableColumn<EvaluationRow>[]
  >(
    () => [
      {
        key: "position",
        header: "Internship",
        render: (row) => (
          <div>
            <div className="fw-semibold">
              {row.internship.position}
            </div>
            <div className="small text-secondary">
              {row.studentLabel}
            </div>
          </div>
        ),
      },
      {
        key: "status",
        header: "Trạng thái",
        className: "text-nowrap",
        render: (row) => (
          <StatusBadge status={row.internship.status} />
        ),
      },
      {
        key: "evaluation",
        header: "Đánh giá hiện tại",
        render: (row) =>
          row.evaluation ? (
            <div>
              <div className="fw-semibold">
                {row.evaluation.score}/10
              </div>
              <div className="small text-secondary">
                {row.evaluation.comment ||
                  "Không có nhận xét."}
              </div>
            </div>
          ) : (
            <span className="text-secondary">
              Chưa đánh giá
            </span>
          ),
      },
      {
        key: "evaluatedAt",
        header: "Ngày đánh giá",
        className: "text-nowrap",
        render: (row) =>
          row.evaluation
            ? formatDate(row.evaluation.evaluatedAt)
            : "—",
      },
      {
        key: "actions",
        header: "Thao tác",
        className: "text-end text-nowrap",
        render: (row) =>
          row.hasEvaluation ? (
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary rounded-pill"
              disabled
            >
              <i className="bi bi-check2-circle me-1" />
              Đã đánh giá
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-sm btn-primary rounded-pill"
              onClick={() => {
                setSelectedInternshipId(row.internship.id);
                setDraft(DEFAULT_DRAFT);
              }}
            >
              <i className="bi bi-clipboard-check me-1" />
              Evaluate
            </button>
          ),
      },
    ],
    [],
  );

  if (loading) {
    return (
      <div className="container-fluid px-0">
        <LoadingState message="Đang tải đánh giá doanh nghiệp..." />
      </div>
    );
  }

  return (
    <div className="container-fluid px-0">
      <PageHeader
        title="Đánh giá"
        subtitle="Đánh giá thực tập sinh theo thang điểm 0-10 và lưu phản hồi chính thức của doanh nghiệp."
      />

      {error ? (
        <div className="alert alert-danger shadow-sm rounded-3 border-0">
          <i className="bi bi-exclamation-octagon me-2" />
          {error}
        </div>
      ) : null}

      {selectedRow ? (
        <div className="card border-0 shadow-sm rounded-3 mb-4">
          <div className="card-body p-4">
            <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-3">
              <div>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <h2 className="h5 mb-0">
                    Evaluate {selectedRow.internship.position}
                  </h2>
                  <StatusBadge
                    status={selectedRow.internship.status}
                  />
                </div>
                <p className="text-secondary mb-0">
                  {selectedRow.studentLabel}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-outline-secondary rounded-pill align-self-start"
                onClick={() => {
                  setSelectedInternshipId(null);
                  setDraft(DEFAULT_DRAFT);
                }}
                disabled={submitting}
              >
                <i className="bi bi-x-lg me-2" />
                Đóng
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                <div className="col-12 col-lg-4">
                  <label className="form-label fw-semibold">
                    Điểm (0-10)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    step="0.1"
                    className="form-control rounded-3"
                    value={draft.score}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        score: event.target.value,
                      }))
                    }
                    disabled={submitting}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">
                    Nhận xét
                  </label>
                  <textarea
                    className="form-control rounded-3"
                    rows={4}
                    value={draft.comment}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        comment: event.target.value,
                      }))
                    }
                    disabled={submitting}
                    placeholder="Nhận xét về thái độ, kỹ năng và kết quả thực tập."
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-3">
                <button
                  type="button"
                  className="btn btn-outline-secondary rounded-pill"
                  onClick={() => {
                    setSelectedInternshipId(null);
                    setDraft(DEFAULT_DRAFT);
                  }}
                  disabled={submitting}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn btn-primary rounded-pill px-4"
                  disabled={submitting}
                >
                  <i className="bi bi-check2-circle me-2" />
                  {submitting
                    ? "Đang lưu..."
                    : "Lưu đánh giá"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {rows.length === 0 ? (
        <EmptyState
          title="Chưa có internship để đánh giá"
          description="Chỉ các internship đang hoạt động hoặc đã hoàn tất mới xuất hiện trong danh sách đánh giá."
          icon="bi-clipboard-check"
        />
      ) : (
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(row) => row.internship.id}
          emptyTitle="Chưa có internship để đánh giá"
          emptyDescription="Danh sách sẽ hiển thị khi doanh nghiệp có internship phù hợp."
        />
      )}
    </div>
  );
}

export default EvaluationsPage;
