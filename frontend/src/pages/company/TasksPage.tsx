import { useEffect, useMemo, useState } from "react";
import {
  createTask,
  getMyCompanyInternships,
  getTasksByWorkPlanId,
  getWorkPlanByInternshipId,
} from "../../api/internship-api";
import DataTable, {
  type DataTableColumn,
} from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import type {
  Internship,
  StudentSummary,
  Task,
  TaskRequest,
  WorkPlan,
} from "../../types";
import {
  findUserLabel,
  formatDate,
  formatDateRange,
  isActiveInternship,
  loadUsersByIds,
  toErrorMessage,
} from "./company-page-utils";

interface WorkPlanOption {
  internship: Internship;
  workPlan: WorkPlan;
}

interface TaskDraft {
  title: string;
  description: string;
  startDate: string;
  dueDate: string;
}

const DEFAULT_TASK_DRAFT: TaskDraft = {
  title: "",
  description: "",
  startDate: "",
  dueDate: "",
};

function TasksPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workPlanOptions, setWorkPlanOptions] = useState<
    WorkPlanOption[]
  >([]);
  const [usersById, setUsersById] = useState<
    Map<number, StudentSummary>
  >(new Map());
  const [selectedWorkPlanId, setSelectedWorkPlanId] =
    useState("");
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [draft, setDraft] = useState<TaskDraft>(
    DEFAULT_TASK_DRAFT,
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void loadWorkPlans();
  }, []);

  useEffect(() => {
    if (!selectedWorkPlanId) {
      setTasks([]);
      return;
    }

    void loadTasks(Number(selectedWorkPlanId));
  }, [selectedWorkPlanId]);

  async function loadWorkPlans() {
    setLoading(true);
    setError("");

    try {
      const internships = await getMyCompanyInternships();
      const activeInternships = internships.filter(
        isActiveInternship,
      );

      const results = await Promise.all(
        activeInternships.map(async (internship) => {
          try {
            const workPlan = await getWorkPlanByInternshipId(
              internship.id,
            );
            return { internship, workPlan };
          } catch (workPlanError) {
            const message = toErrorMessage(
              workPlanError,
              "Không thể tải kế hoạch thực tập.",
            );

            if (
              message.toLowerCase().includes("not found") ||
              message.toLowerCase().includes("work plan not found")
            ) {
              return null;
            }

            throw workPlanError;
          }
        }),
      );

      const nextOptions = results.filter(
        (item): item is WorkPlanOption => item !== null,
      );

      setWorkPlanOptions(nextOptions);
      setUsersById(
        await loadUsersByIds(
          nextOptions.map((option) => option.internship.studentId),
        ),
      );
      setSelectedWorkPlanId((current) =>
        current ||
        (nextOptions[0]
          ? String(nextOptions[0].workPlan.id)
          : ""),
      );
    } catch (loadError) {
      console.error("Failed to load work plans:", loadError);
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

  async function loadTasks(workPlanId: number) {
    setTasksLoading(true);
    setError("");

    try {
      const taskList = await getTasksByWorkPlanId(workPlanId);
      setTasks(taskList);
    } catch (loadError) {
      console.error("Failed to load tasks:", loadError);
      setError(
        toErrorMessage(
          loadError,
          "Không thể tải danh sách công việc.",
        ),
      );
    } finally {
      setTasksLoading(false);
    }
  }

  const selectedWorkPlanOption = useMemo(
    () =>
      workPlanOptions.find(
        (option) =>
          option.workPlan.id === Number(selectedWorkPlanId),
      ) ?? null,
    [selectedWorkPlanId, workPlanOptions],
  );

  async function handleCreateTask(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedWorkPlanOption) {
      return;
    }

    if (
      !draft.title.trim() ||
      !draft.startDate ||
      !draft.dueDate
    ) {
      setError(
        "Vui lòng nhập đầy đủ tiêu đề, ngày bắt đầu và hạn hoàn thành.",
      );
      return;
    }

    setSubmitting(true);
    setError("");

    const payload: TaskRequest = {
      title: draft.title.trim(),
      description: draft.description.trim() || null,
      startDate: draft.startDate,
      dueDate: draft.dueDate,
    };

    try {
      const createdTask = await createTask(
        selectedWorkPlanOption.workPlan.id,
        payload,
      );
      setTasks((current) => [...current, createdTask]);
      setDraft(DEFAULT_TASK_DRAFT);
    } catch (submitError) {
      console.error("Failed to create task:", submitError);
      setError(
        toErrorMessage(
          submitError,
          "Không thể tạo công việc mới.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  }

  const columns = useMemo<DataTableColumn<Task>[]>(
    () => [
      {
        key: "title",
        header: "Công việc",
        render: (task) => (
          <div>
            <div className="fw-semibold">{task.title}</div>
            <div className="small text-secondary">
              {task.description || "Chưa có mô tả."}
            </div>
          </div>
        ),
      },
      {
        key: "startDate",
        header: "Bắt đầu",
        className: "text-nowrap",
        render: (task) => formatDate(task.startDate),
      },
      {
        key: "dueDate",
        header: "Hạn hoàn thành",
        className: "text-nowrap",
        render: (task) => formatDate(task.dueDate),
      },
      {
        key: "status",
        header: "Trạng thái",
        className: "text-nowrap",
        render: (task) => <StatusBadge status={task.status} />,
      },
    ],
    [],
  );

  if (loading) {
    return (
      <div className="container-fluid px-0">
        <LoadingState message="Đang tải danh sách kế hoạch..." />
      </div>
    );
  }

  return (
    <div className="container-fluid px-0">
      <PageHeader
        title="Công việc"
        subtitle="Tạo và theo dõi các đầu việc cho từng kế hoạch thực tập. Trạng thái do sinh viên tự cập nhật."
      />

      {error ? (
        <div className="alert alert-danger shadow-sm rounded-3 border-0">
          <i className="bi bi-exclamation-octagon me-2" />
          {error}
        </div>
      ) : null}

      {workPlanOptions.length === 0 ? (
        <EmptyState
          title="Chưa có kế hoạch thực tập"
          description="Hãy tạo Work Plan trước khi phân công task cho thực tập sinh."
          icon="bi-list-task"
        />
      ) : (
        <>
          <div className="card border-0 shadow-sm rounded-3 mb-4">
            <div className="card-body p-4">
              <div className="row g-3 align-items-end">
                <div className="col-12 col-xl-6">
                  <label
                    htmlFor="workPlanId"
                    className="form-label fw-semibold"
                  >
                    Chọn kế hoạch thực tập
                  </label>
                  <select
                    id="workPlanId"
                    className="form-select rounded-3"
                    value={selectedWorkPlanId}
                    onChange={(event) =>
                      setSelectedWorkPlanId(
                        event.target.value,
                      )
                    }
                  >
                    {workPlanOptions.map((option) => (
                      <option
                        key={option.workPlan.id}
                        value={option.workPlan.id}
                      >
                        Internship #{option.internship.id} ·{" "}
                        {option.internship.position} ·{" "}
                        {findUserLabel(usersById, option.internship.studentId)} ·{" "}
                        {option.workPlan.title}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedWorkPlanOption ? (
                  <div className="col-12 col-xl-6">
                    <div className="p-3 bg-body-tertiary rounded-3 h-100">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <i className="bi bi-diagram-3 text-primary" />
                        <span className="fw-semibold">
                          {selectedWorkPlanOption.workPlan.title}
                        </span>
                      </div>
                      <p className="text-secondary mb-1">
                        Sinh viên:{" "}
                        {findUserLabel(
                          usersById,
                          selectedWorkPlanOption.internship.studentId,
                        )}
                      </p>
                      <p className="text-secondary mb-1">
                        {selectedWorkPlanOption.workPlan.description ||
                          "Chưa có mô tả kế hoạch."}
                      </p>
                      <p className="mb-0 small">
                        {formatDateRange(
                          selectedWorkPlanOption.workPlan.startDate,
                          selectedWorkPlanOption.workPlan.endDate,
                        )}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-3 mb-4">
            <div className="card-body p-4">
              <div className="d-flex align-items-center gap-2 mb-3">
                <i className="bi bi-plus-square text-primary" />
                <h2 className="h5 mb-0">Tạo công việc</h2>
              </div>

              <form onSubmit={handleCreateTask}>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label fw-semibold">
                      Tiêu đề công việc
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
                      disabled={submitting}
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
                          description: event.target.value,
                        }))
                      }
                      disabled={submitting}
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
                      disabled={submitting}
                    />
                  </div>
                  <div className="col-12 col-lg-6">
                    <label className="form-label fw-semibold">
                      Hạn hoàn thành
                    </label>
                    <input
                      type="date"
                      className="form-control rounded-3"
                      value={draft.dueDate}
                      onChange={(event) =>
                        setDraft((current) => ({
                          ...current,
                          dueDate: event.target.value,
                        }))
                      }
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="d-flex justify-content-end mt-3">
                  <button
                    type="submit"
                    className="btn btn-primary rounded-pill px-4"
                    disabled={
                      submitting || !selectedWorkPlanOption
                    }
                  >
                    <i className="bi bi-plus-lg me-2" />
                    {submitting ? "Đang tạo..." : "Tạo task"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <DataTable
            columns={columns}
            rows={tasks}
            rowKey={(task) => task.id}
            loading={tasksLoading}
            loadingMessage="Đang tải danh sách công việc..."
            emptyTitle="Chưa có task nào"
            emptyDescription="Hãy tạo công việc đầu tiên cho kế hoạch đang chọn."
          />
        </>
      )}
    </div>
  );
}

export default TasksPage;
