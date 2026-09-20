import { useEffect, useMemo, useState } from "react";
import {
  getCompanyInternshipLogs,
  getMyCompanyInternships,
} from "../../api/internship-api";
import DataTable, {
  type DataTableColumn,
} from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import type { Internship, InternshipLog, StudentSummary } from "../../types";
import {
  findUserLabel,
  formatDate,
  formatDateRange,
  isActiveInternship,
  loadUsersByIds,
  toErrorMessage,
} from "./company-page-utils";

function InternLogsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [internships, setInternships] = useState<Internship[]>(
    [],
  );
  const [usersById, setUsersById] = useState<
    Map<number, StudentSummary>
  >(new Map());
  const [selectedInternshipId, setSelectedInternshipId] =
    useState("");
  const [logsLoading, setLogsLoading] = useState(false);
  const [logs, setLogs] = useState<InternshipLog[]>([]);

  useEffect(() => {
    void loadInternships();
  }, []);

  useEffect(() => {
    if (!selectedInternshipId) {
      setLogs([]);
      return;
    }

    void loadLogs(Number(selectedInternshipId));
  }, [selectedInternshipId]);

  async function loadInternships() {
    setLoading(true);
    setError("");

    try {
      const internshipList = await getMyCompanyInternships();
      const activeInternships = internshipList.filter(
        isActiveInternship,
      );
      setInternships(activeInternships);
      setUsersById(
        await loadUsersByIds(
          activeInternships.map((internship) => internship.studentId),
        ),
      );
      setSelectedInternshipId((current) =>
        current ||
        (activeInternships[0]
          ? String(activeInternships[0].id)
          : ""),
      );
    } catch (loadError) {
      console.error("Failed to load internships:", loadError);
      setError(
        toErrorMessage(
          loadError,
          "Không thể tải danh sách internship.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadLogs(internshipId: number) {
    setLogsLoading(true);
    setError("");

    try {
      const logList = await getCompanyInternshipLogs(
        internshipId,
      );
      setLogs(logList);
    } catch (loadError) {
      console.error("Failed to load internship logs:", loadError);
      setError(
        toErrorMessage(
          loadError,
          "Không thể tải nhật ký thực tập.",
        ),
      );
    } finally {
      setLogsLoading(false);
    }
  }

  const selectedInternship = useMemo(
    () =>
      internships.find(
        (internship) =>
          internship.id === Number(selectedInternshipId),
      ) ?? null,
    [internships, selectedInternshipId],
  );

  const columns = useMemo<DataTableColumn<InternshipLog>[]>(
    () => [
      {
        key: "logDate",
        header: "Ngày ghi log",
        className: "text-nowrap",
        render: (log) => formatDate(log.logDate),
      },
      {
        key: "content",
        header: "Nội dung",
      },
      {
        key: "result",
        header: "Kết quả",
        render: (log) => log.result || "—",
      },
      {
        key: "note",
        header: "Ghi chú",
        render: (log) => log.note || "—",
      },
    ],
    [],
  );

  if (loading) {
    return (
      <div className="container-fluid px-0">
        <LoadingState message="Đang tải internship logs..." />
      </div>
    );
  }

  return (
    <div className="container-fluid px-0">
      <PageHeader
        title="Nhật ký thực tập sinh"
        subtitle="Theo dõi nhật ký công việc của thực tập sinh theo từng internship đang hoạt động."
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
          description="Khi thực tập sinh bắt đầu làm việc, nhật ký thực tập sẽ được hiển thị tại đây."
          icon="bi-journal-text"
        />
      ) : (
        <>
          <div className="card border-0 shadow-sm rounded-3 mb-4">
            <div className="card-body p-4">
              <div className="row g-3 align-items-end">
                <div className="col-12 col-xl-6">
                  <label
                    htmlFor="internshipId"
                    className="form-label fw-semibold"
                  >
                    Chọn internship
                  </label>
                  <select
                    id="internshipId"
                    className="form-select rounded-3"
                    value={selectedInternshipId}
                    onChange={(event) =>
                      setSelectedInternshipId(
                        event.target.value,
                      )
                    }
                  >
                    {internships.map((internship) => (
                      <option
                        key={internship.id}
                        value={internship.id}
                      >
                        Internship #{internship.id} ·{" "}
                        {internship.position} ·{" "}
                        {findUserLabel(usersById, internship.studentId)}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedInternship ? (
                  <div className="col-12 col-xl-6">
                    <div className="p-3 bg-body-tertiary rounded-3 h-100">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <StatusBadge
                          status={selectedInternship.status}
                        />
                        <span className="fw-semibold">
                          {selectedInternship.position}
                        </span>
                      </div>
                      <p className="text-secondary mb-1">
                        Sinh viên:{" "}
                        {findUserLabel(
                          usersById,
                          selectedInternship.studentId,
                        )}
                      </p>
                      <p className="text-secondary mb-1">
                        {selectedInternship.description ||
                          "Chưa có mô tả internship."}
                      </p>
                      <p className="mb-0 small">
                        {formatDateRange(
                          selectedInternship.startDate,
                          selectedInternship.endDate,
                        )}
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <DataTable
            columns={columns}
            rows={logs}
            rowKey={(log) => log.id}
            loading={logsLoading}
            loadingMessage="Đang tải nhật ký thực tập..."
            emptyTitle="Chưa có log nào"
            emptyDescription="Sinh viên chưa gửi nhật ký cho internship này."
          />
        </>
      )}
    </div>
  );
}

export default InternLogsPage;
