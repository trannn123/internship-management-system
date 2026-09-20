import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getInternshipOpportunities } from "../../api/internship-opportunity-api";
import {
  assignLecturerToPeriod,
  getAssignedLecturers,
  getInternshipPeriodById,
  removeLecturerFromPeriod,
} from "../../api/internship-period-api";
import { getInternshipRegistrations } from "../../api/internship-registration-api";
import { getAllLecturers, getAllUsers } from "../../api/user-api";
import ConfirmModal from "../../components/ui/ConfirmModal";
import DataTable, {
  type DataTableColumn,
} from "../../components/ui/DataTable";
import EmptyState from "../../components/ui/EmptyState";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import StatusBadge from "../../components/ui/StatusBadge";
import type {
  InternshipOpportunity,
  InternshipPeriod,
  InternshipPeriodLecturer,
  InternshipRegistration,
  LecturerSummary,
  User,
} from "../../types";

interface DetailData {
  period: InternshipPeriod;
  lecturers: InternshipPeriodLecturer[];
  users: User[];
  allLecturers: LecturerSummary[];
  opportunities: InternshipOpportunity[];
  registrations: InternshipRegistration[];
}

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

function InternshipPeriodDetailPage() {
  const { id } = useParams();
  const periodId = id ? Number(id) : Number.NaN;

  const [data, setData] = useState<DetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedLecturerId, setSelectedLecturerId] = useState("");
  const [assignError, setAssignError] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [removingLecturer, setRemovingLecturer] =
    useState<InternshipPeriodLecturer | null>(null);
  const [busyRemoving, setBusyRemoving] = useState(false);

  useEffect(() => {
    async function loadDetail() {
      if (Number.isNaN(periodId)) {
        setError("Mã đợt thực tập không hợp lệ.");
        setLoading(false);
        return;
      }

      try {
        const [period, lecturers, users, allLecturers, allOpportunities, allRegistrations] =
          await Promise.all([
            getInternshipPeriodById(periodId),
            getAssignedLecturers(periodId),
            getAllUsers(),
            getAllLecturers(),
            getInternshipOpportunities(),
            getInternshipRegistrations(),
          ]);

        setData({
          period,
          lecturers,
          users,
          allLecturers,
          opportunities: allOpportunities.filter(
            (opportunity) => opportunity.periodId === periodId,
          ),
          registrations: allRegistrations.filter(
            (registration) => registration.periodId === periodId,
          ),
        });
      } catch (loadError) {
        console.error("Failed to load internship period detail:", loadError);
        setError("Không thể tải chi tiết đợt thực tập.");
      } finally {
        setLoading(false);
      }
    }

    void loadDetail();
  }, [periodId]);

  const lecturerMap = useMemo(() => {
    return new Map((data?.allLecturers ?? []).map((lecturer) => [lecturer.id, lecturer]));
  }, [data?.allLecturers]);

  const availableLecturers = useMemo(() => {
    if (!data) {
      return [];
    }

    const assignedIds = new Set(data.lecturers.map((item) => item.lecturerId));

    return data.allLecturers.filter((lecturer) => !assignedIds.has(lecturer.id));
  }, [data]);

  async function handleAssignLecturer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!data) {
      return;
    }

    const lecturerId = Number(selectedLecturerId);

    if (!lecturerId || Number.isNaN(lecturerId)) {
      setAssignError("Vui lòng chọn một giảng viên.");
      return;
    }

    if (data.lecturers.some((item) => item.lecturerId === lecturerId)) {
      setAssignError("Giảng viên này đã được gán cho đợt thực tập.");
      return;
    }

    setAssigning(true);
    setAssignError("");

    try {
      const created = await assignLecturerToPeriod(data.period.id, {
        lecturerId,
      });

      setData((current) =>
        current
          ? {
              ...current,
              lecturers: [...current.lecturers, created],
            }
          : current,
      );
      setSelectedLecturerId("");
      setShowAssignModal(false);
    } catch (assignLecturerError) {
      console.error("Failed to assign lecturer:", assignLecturerError);
      setAssignError("Không thể gán giảng viên cho đợt thực tập.");
    } finally {
      setAssigning(false);
    }
  }

  async function handleRemoveLecturer() {
    if (!data || !removingLecturer) {
      return;
    }

    setBusyRemoving(true);

    try {
      await removeLecturerFromPeriod(data.period.id, removingLecturer.lecturerId);
      setData((current) =>
        current
          ? {
              ...current,
              lecturers: current.lecturers.filter(
                (item) => item.id !== removingLecturer.id,
              ),
            }
          : current,
      );
      setRemovingLecturer(null);
    } catch (removeError) {
      console.error("Failed to remove lecturer from period:", removeError);
      setError("Không thể gỡ giảng viên khỏi đợt thực tập.");
    } finally {
      setBusyRemoving(false);
    }
  }

  if (loading) {
    return <LoadingState message="Đang tải chi tiết đợt thực tập..." />;
  }

  if (error) {
    return (
      <div className="alert alert-danger border-0 shadow-sm mb-0" role="alert">
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="Không tìm thấy đợt thực tập"
        description="Đợt thực tập này có thể đã bị xóa hoặc chưa tồn tại."
        icon="bi-calendar2-x"
      />
    );
  }

  const lecturerColumns: DataTableColumn<InternshipPeriodLecturer>[] = [
    {
      key: "lecturer",
      header: "Giảng viên",
      render: (assignment) => {
        const lecturer = lecturerMap.get(assignment.lecturerId);

        return (
          <div>
            <p className="fw-semibold mb-1">{lecturer?.fullName ?? "Chưa có thông tin"}</p>
            <p className="text-secondary small mb-0">
              {lecturer?.email ?? "Không có email"}
            </p>
          </div>
        );
      },
    },
    {
      key: "lecturerId",
      header: "Lecturer ID",
      className: "text-nowrap",
      render: (assignment) => assignment.lecturerId,
    },
    {
      key: "actions",
      header: "",
      className: "text-end text-nowrap",
      render: (assignment) => (
        <button
          type="button"
          className="btn btn-sm btn-outline-danger"
          onClick={() => setRemovingLecturer(assignment)}
        >
          <i className="bi bi-person-dash me-1" />
          Remove
        </button>
      ),
    },
  ];

  const opportunityColumns: DataTableColumn<InternshipOpportunity>[] = [
    {
      key: "position",
      header: "Vị trí",
      render: (opportunity) => (
        <div>
          <p className="fw-semibold mb-1">{opportunity.position}</p>
          <p className="text-secondary small mb-0">
            Company ID: {opportunity.companyId}
          </p>
        </div>
      ),
    },
    {
      key: "quantity",
      header: "Số lượng",
      className: "text-nowrap",
      render: (opportunity) => opportunity.quantity ?? "—",
    },
    {
      key: "location",
      header: "Địa điểm",
      render: (opportunity) => opportunity.location ?? "—",
    },
    {
      key: "status",
      header: "Trạng thái",
      className: "text-nowrap",
      render: (opportunity) => <StatusBadge status={opportunity.status} />,
    },
  ];

  const registrationColumns: DataTableColumn<InternshipRegistration>[] = [
    {
      key: "id",
      header: "Đăng ký",
      render: (registration) => (
        <div>
          <p className="fw-semibold mb-1">Registration #{registration.id}</p>
          <p className="text-secondary small mb-0">
            Opportunity ID: {registration.opportunityId}
          </p>
        </div>
      ),
    },
    {
      key: "studentId",
      header: "Student ID",
      className: "text-nowrap",
      render: (registration) => registration.studentId,
    },
    {
      key: "lecturerId",
      header: "Lecturer ID",
      className: "text-nowrap",
      render: (registration) => registration.lecturerId,
    },
    {
      key: "status",
      header: "Trạng thái",
      className: "text-nowrap",
      render: (registration) => <StatusBadge status={registration.status} />,
    },
  ];

  const removingLecturerUser = removingLecturer
    ? lecturerMap.get(removingLecturer.lecturerId)
    : null;

  return (
    <div className="d-flex flex-column gap-4">
      <PageHeader
        title={data.period.name}
        subtitle="Chi tiết đợt thực tập, phân công giảng viên và dữ liệu liên quan."
        actions={(
          <>
            <Link to="/admin/periods" className="btn btn-outline-secondary">
              <i className="bi bi-arrow-left me-2" />
              Quay lại
            </Link>
            <Link to={`/admin/periods/${data.period.id}/edit`} className="btn btn-primary">
              <i className="bi bi-pencil-square me-2" />
              Chỉnh sửa
            </Link>
          </>
        )}
      />

      <section className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-4">
          <div className="d-flex flex-column flex-lg-row align-items-lg-start justify-content-between gap-3 mb-4">
            <div>
              <h2 className="h5 mb-1">Thông tin đợt thực tập</h2>
              <p className="text-secondary mb-0">
                Mã đợt: {data.period.id}
              </p>
            </div>
            <StatusBadge status={data.period.status} />
          </div>

          <div className="row g-3">
            <div className="col-12">
              <div className="p-3 bg-body-tertiary rounded-3">
                <p className="text-secondary text-uppercase small fw-semibold mb-2">
                  Mô tả
                </p>
                <p className="mb-0">{data.period.description ?? "Chưa có mô tả."}</p>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="p-3 bg-body-tertiary rounded-3 h-100">
                <p className="text-secondary text-uppercase small fw-semibold mb-2">
                  Thời gian đăng ký
                </p>
                <p className="mb-0">
                  {formatDate(data.period.registrationStartDate)} →{" "}
                  {formatDate(data.period.registrationEndDate)}
                </p>
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="p-3 bg-body-tertiary rounded-3 h-100">
                <p className="text-secondary text-uppercase small fw-semibold mb-2">
                  Thời gian thực tập
                </p>
                <p className="mb-0">
                  {formatDate(data.period.internshipStartDate)} →{" "}
                  {formatDate(data.period.internshipEndDate)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-4">
          <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
            <div>
              <h2 className="h5 mb-1">Giảng viên phụ trách</h2>
              <p className="text-secondary mb-0">
                Quản lý phân công giảng viên cho đợt thực tập này.
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setAssignError("");
                setShowAssignModal(true);
              }}
            >
              <i className="bi bi-person-plus me-2" />
              Phân công giảng viên
            </button>
          </div>

          <DataTable
            columns={lecturerColumns}
            rows={data.lecturers}
            rowKey={(assignment) => assignment.id}
            emptyTitle="Chưa có giảng viên được phân công"
            emptyDescription="Hãy gán giảng viên để bắt đầu theo dõi sinh viên trong đợt này."
          />
        </div>
      </section>

      <div className="row g-4">
        <div className="col-12 col-xxl-6">
          <section className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-body p-4">
              <div className="mb-4">
                <h2 className="h5 mb-1">Cơ hội thực tập</h2>
                <p className="text-secondary mb-0">
                  Danh sách cơ hội thuộc đợt thực tập này.
                </p>
              </div>

              <DataTable
                columns={opportunityColumns}
                rows={data.opportunities}
                rowKey={(opportunity) => opportunity.id}
                emptyTitle="Chưa có cơ hội thực tập"
                emptyDescription="Hiện chưa có cơ hội thực tập nào thuộc đợt này."
              />
            </div>
          </section>
        </div>

        <div className="col-12 col-xxl-6">
          <section className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-body p-4">
              <div className="mb-4">
                <h2 className="h5 mb-1">Đăng ký thực tập</h2>
                <p className="text-secondary mb-0">
                  Tổng hợp hồ sơ đăng ký liên quan đến đợt này.
                </p>
              </div>

              <DataTable
                columns={registrationColumns}
                rows={data.registrations}
                rowKey={(registration) => registration.id}
                emptyTitle="Chưa có đăng ký thực tập"
                emptyDescription="Chưa có hồ sơ đăng ký nào cho đợt thực tập này."
              />
            </div>
          </section>
        </div>
      </div>

      {showAssignModal ? (
        <>
          <div
            className="modal fade show d-block"
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow">
                <form onSubmit={handleAssignLecturer}>
                  <div className="modal-header">
                    <h2 className="modal-title fs-5 mb-0">Phân công giảng viên</h2>
                    <button
                      type="button"
                      className="btn-close"
                      aria-label="Đóng"
                      onClick={() => {
                        if (!assigning) {
                          setShowAssignModal(false);
                        }
                      }}
                      disabled={assigning}
                    />
                  </div>
                  <div className="modal-body">
                    <p className="text-secondary">
                      Chọn một giảng viên để gán vào đợt thực tập này.
                    </p>

                    {assignError ? (
                      <div className="alert alert-danger border-0 mb-3" role="alert">
                        {assignError}
                      </div>
                    ) : null}

                    <label htmlFor="lecturer-select" className="form-label fw-semibold">
                      Giảng viên
                    </label>
                    <select
                      id="lecturer-select"
                      className="form-select"
                      value={selectedLecturerId}
                      onChange={(event) => setSelectedLecturerId(event.target.value)}
                      required
                      disabled={assigning || availableLecturers.length === 0}
                    >
                      <option value="" disabled>
                        {availableLecturers.length === 0
                          ? "Không còn giảng viên nào để gán"
                          : "-- Chọn giảng viên --"}
                      </option>
                      {availableLecturers.map((lecturer) => (
                        <option key={lecturer.id} value={lecturer.id}>
                          {lecturer.fullName ?? `Lecturer #${lecturer.id}`}
                          {lecturer.email ? ` (${lecturer.email})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowAssignModal(false)}
                      disabled={assigning}
                    >
                      Hủy
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={assigning}>
                      {assigning ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            aria-hidden="true"
                          />
                          Đang gán...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check2-circle me-2" />
                          Xác nhận gán
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" />
        </>
      ) : null}

      <ConfirmModal
        show={removingLecturer !== null}
        title="Gỡ giảng viên khỏi đợt thực tập"
        message={
          removingLecturer
            ? `Bạn có chắc muốn gỡ ${
                removingLecturerUser?.fullName ?? `lecturer #${removingLecturer.lecturerId}`
              } khỏi đợt thực tập này không?`
            : ""
        }
        confirmLabel="Gỡ giảng viên"
        confirmVariant="danger"
        busy={busyRemoving}
        onCancel={() => {
          if (!busyRemoving) {
            setRemovingLecturer(null);
          }
        }}
        onConfirm={() => {
          void handleRemoveLecturer();
        }}
      />
    </div>
  );
}

export default InternshipPeriodDetailPage;
