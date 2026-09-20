import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createInternshipPeriod,
  getInternshipPeriodById,
  updateInternshipPeriod,
} from "../../api/internship-period-api";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import {
  InternshipPeriodStatus,
  type InternshipPeriodRequest,
} from "../../types";

interface FormState {
  name: string;
  description: string;
  registrationStartDate: string;
  registrationEndDate: string;
  internshipStartDate: string;
  internshipEndDate: string;
  status: keyof typeof InternshipPeriodStatus;
}

const INITIAL_FORM: FormState = {
  name: "",
  description: "",
  registrationStartDate: "",
  registrationEndDate: "",
  internshipStartDate: "",
  internshipEndDate: "",
  status: "DRAFT",
};

const STATUS_OPTIONS = Object.values(InternshipPeriodStatus);

function InternshipPeriodFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const periodId = id ? Number(id) : null;

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    async function loadPeriod() {
      if (!isEditMode) {
        setLoading(false);
        return;
      }

      if (periodId === null || Number.isNaN(periodId)) {
        setError("Mã đợt thực tập không hợp lệ.");
        setLoading(false);
        return;
      }

      try {
        const period = await getInternshipPeriodById(periodId);
        setForm({
          name: period.name,
          description: period.description ?? "",
          registrationStartDate: period.registrationStartDate ?? "",
          registrationEndDate: period.registrationEndDate ?? "",
          internshipStartDate: period.internshipStartDate ?? "",
          internshipEndDate: period.internshipEndDate ?? "",
          status: period.status ?? "DRAFT",
        });
      } catch (loadError) {
        console.error("Failed to load internship period:", loadError);
        setError("Không thể tải thông tin đợt thực tập.");
      } finally {
        setLoading(false);
      }
    }

    void loadPeriod();
  }, [isEditMode, periodId]);

  const pageTitle = useMemo(() => {
    return isEditMode ? "Chỉnh sửa đợt thực tập" : "Tạo đợt thực tập";
  }, [isEditMode]);

  function updateField<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function validateForm() {
    const nextErrors: string[] = [];

    if (!form.name.trim()) {
      nextErrors.push("Tên đợt thực tập là bắt buộc.");
    }

    if (!form.registrationStartDate) {
      nextErrors.push("Ngày bắt đầu đăng ký là bắt buộc.");
    }

    if (!form.registrationEndDate) {
      nextErrors.push("Ngày kết thúc đăng ký là bắt buộc.");
    }

    if (!form.internshipStartDate) {
      nextErrors.push("Ngày bắt đầu thực tập là bắt buộc.");
    }

    if (!form.internshipEndDate) {
      nextErrors.push("Ngày kết thúc thực tập là bắt buộc.");
    }

    if (
      form.registrationStartDate &&
      form.registrationEndDate &&
      form.registrationEndDate <= form.registrationStartDate
    ) {
      nextErrors.push("Ngày kết thúc đăng ký phải sau ngày bắt đầu đăng ký.");
    }

    if (
      form.internshipStartDate &&
      form.internshipEndDate &&
      form.internshipEndDate <= form.internshipStartDate
    ) {
      nextErrors.push("Ngày kết thúc thực tập phải sau ngày bắt đầu thực tập.");
    }

    if (
      form.registrationEndDate &&
      form.internshipStartDate &&
      form.internshipStartDate < form.registrationEndDate
    ) {
      nextErrors.push("Ngày bắt đầu thực tập phải sau hoặc bằng ngày kết thúc đăng ký.");
    }

    setValidationErrors(nextErrors);
    return nextErrors.length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    setError("");

    const payload: InternshipPeriodRequest = {
      name: form.name.trim(),
      description: form.description.trim() ? form.description.trim() : null,
      registrationStartDate: form.registrationStartDate,
      registrationEndDate: form.registrationEndDate,
      internshipStartDate: form.internshipStartDate,
      internshipEndDate: form.internshipEndDate,
      status: isEditMode ? form.status : "DRAFT",
    };

    try {
      if (isEditMode && periodId !== null && !Number.isNaN(periodId)) {
        await updateInternshipPeriod(periodId, payload);
      } else {
        await createInternshipPeriod(payload);
      }

      navigate("/admin/periods");
    } catch (saveError) {
      console.error("Failed to save internship period:", saveError);
      setError("Không thể lưu đợt thực tập. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <LoadingState message="Đang tải biểu mẫu đợt thực tập..." />;
  }

  return (
    <div className="d-flex flex-column gap-4">
      <PageHeader
        title={pageTitle}
        subtitle="Quản lý thời gian đăng ký, lịch thực tập và trạng thái của từng đợt."
        actions={(
          <Link to="/admin/periods" className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-2" />
            Quay lại danh sách
          </Link>
        )}
      />

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-4 p-lg-5">
          {error ? (
            <div className="alert alert-danger border-0 shadow-sm" role="alert">
              {error}
            </div>
          ) : null}

          {validationErrors.length > 0 ? (
            <div className="alert alert-warning border-0 shadow-sm" role="alert">
              <div className="fw-semibold mb-2">Vui lòng kiểm tra lại thông tin:</div>
              <ul className="mb-0 ps-3">
                {validationErrors.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="row g-4">
            <div className="col-12">
              <label htmlFor="period-name" className="form-label fw-semibold">
                Tên đợt thực tập
              </label>
              <input
                id="period-name"
                className="form-control"
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Ví dụ: Đợt thực tập học kỳ 1 năm 2026"
                required
              />
            </div>

            <div className="col-12">
              <label htmlFor="period-description" className="form-label fw-semibold">
                Mô tả
              </label>
              <textarea
                id="period-description"
                className="form-control"
                rows={4}
                value={form.description}
                onChange={(event) => updateField("description", event.target.value)}
                placeholder="Nhập mô tả ngắn cho đợt thực tập"
              />
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="registration-start-date" className="form-label fw-semibold">
                Ngày bắt đầu đăng ký
              </label>
              <input
                id="registration-start-date"
                type="date"
                className="form-control"
                value={form.registrationStartDate}
                onChange={(event) =>
                  updateField("registrationStartDate", event.target.value)
                }
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="registration-end-date" className="form-label fw-semibold">
                Ngày kết thúc đăng ký
              </label>
              <input
                id="registration-end-date"
                type="date"
                className="form-control"
                value={form.registrationEndDate}
                onChange={(event) =>
                  updateField("registrationEndDate", event.target.value)
                }
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="internship-start-date" className="form-label fw-semibold">
                Ngày bắt đầu thực tập
              </label>
              <input
                id="internship-start-date"
                type="date"
                className="form-control"
                value={form.internshipStartDate}
                onChange={(event) =>
                  updateField("internshipStartDate", event.target.value)
                }
                required
              />
            </div>

            <div className="col-12 col-md-6">
              <label htmlFor="internship-end-date" className="form-label fw-semibold">
                Ngày kết thúc thực tập
              </label>
              <input
                id="internship-end-date"
                type="date"
                className="form-control"
                value={form.internshipEndDate}
                onChange={(event) =>
                  updateField("internshipEndDate", event.target.value)
                }
                required
              />
            </div>

            {isEditMode ? (
              <div className="col-12 col-md-6">
                <label htmlFor="period-status" className="form-label fw-semibold">
                  Trạng thái
                </label>
                <select
                  id="period-status"
                  className="form-select"
                  value={form.status}
                  onChange={(event) =>
                    updateField(
                      "status",
                      event.target.value as keyof typeof InternshipPeriodStatus,
                    )
                  }
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className="col-12 d-flex flex-wrap gap-2 pt-2">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      aria-hidden="true"
                    />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check2-circle me-2" />
                    {isEditMode ? "Lưu thay đổi" : "Tạo đợt thực tập"}
                  </>
                )}
              </button>

              <Link to="/admin/periods" className="btn btn-outline-secondary">
                Hủy
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default InternshipPeriodFormPage;
