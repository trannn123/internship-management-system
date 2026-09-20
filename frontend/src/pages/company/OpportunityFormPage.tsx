import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import { getInternshipPeriods } from "../../api/internship-period-api";
import {
  createInternshipOpportunity,
  getInternshipOpportunityById,
  updateInternshipOpportunity,
} from "../../api/internship-opportunity-api";
import LoadingState from "../../components/ui/LoadingState";
import PageHeader from "../../components/ui/PageHeader";
import type {
  InternshipOpportunityRequest,
  InternshipPeriod,
  OpportunityStatus,
} from "../../types";
import {
  companyPaths,
  formatDateRange,
  toErrorMessage,
} from "./company-page-utils";

interface FormErrors {
  periodId?: string;
  position?: string;
  quantity?: string;
}

function OpportunityFormPage() {
  const navigate = useNavigate();
  const params = useParams<Record<string, string | undefined>>();
  const opportunityId = useMemo(() => {
    const routeValue =
      params.id ??
      params.opportunityId ??
      Object.values(params).find((value) =>
        /^\d+$/.test(value ?? ""),
      );

    return routeValue ? Number(routeValue) : null;
  }, [params]);
  const isEditMode = opportunityId !== null;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [periodLoadError, setPeriodLoadError] = useState("");
  const [periods, setPeriods] = useState<InternshipPeriod[]>([]);

  const [periodId, setPeriodId] = useState("");
  const [position, setPosition] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [location, setLocation] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [status, setStatus] = useState<OpportunityStatus>("OPEN");
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    async function loadForm() {
      setLoading(true);
      setError("");
      setPeriodLoadError("");

      try {
        const [periodList, opportunity] = await Promise.all([
          getInternshipPeriods().catch(
            async (periodError: unknown) => {
              setPeriodLoadError(
                toErrorMessage(
                  periodError,
                  "Không thể tải danh sách kỳ thực tập.",
                ),
              );
              return [] as InternshipPeriod[];
            },
          ),
          isEditMode && opportunityId !== null
            ? getInternshipOpportunityById(opportunityId)
            : Promise.resolve(null),
        ]);

        setPeriods(periodList);

        if (opportunity) {
          setPeriodId(String(opportunity.periodId));
          setPosition(opportunity.position);
          setDescription(opportunity.description ?? "");
          setRequirements(opportunity.requirements ?? "");
          setLocation(opportunity.location ?? "");
          setQuantity(String(opportunity.quantity ?? 1));
          setStatus(opportunity.status ?? "OPEN");
        }
      } catch (loadError) {
        console.error(
          "Failed to load opportunity form:",
          loadError,
        );
        setError(
          toErrorMessage(
            loadError,
            "Không thể tải dữ liệu cơ hội thực tập.",
          ),
        );
      } finally {
        setLoading(false);
      }
    }

    void loadForm();
  }, [isEditMode, opportunityId]);

  const selectablePeriods = useMemo(() => {
    const currentId = Number(periodId || 0);

    return periods.filter(
      (period) =>
        period.status === "OPEN" || period.id === currentId,
    );
  }, [periodId, periods]);

  const usePeriodSelect = selectablePeriods.length > 0;

  function validate() {
    const nextErrors: FormErrors = {};

    if (!periodId || Number(periodId) <= 0) {
      nextErrors.periodId = "Vui lòng chọn kỳ thực tập hợp lệ.";
    }

    if (!position.trim()) {
      nextErrors.position = "Vui lòng nhập vị trí tuyển dụng.";
    }

    if (!quantity || Number(quantity) <= 0) {
      nextErrors.quantity = "Số lượng phải lớn hơn 0.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    setSaving(true);
    setError("");

    const payload: InternshipOpportunityRequest = {
      periodId: Number(periodId),
      position: position.trim(),
      description: description.trim() || null,
      requirements: requirements.trim() || null,
      location: location.trim() || null,
      quantity: Number(quantity),
      status: isEditMode ? status : "OPEN",
    };

    try {
      if (isEditMode && opportunityId !== null) {
        await updateInternshipOpportunity(opportunityId, payload);
      } else {
        await createInternshipOpportunity(payload);
      }

      navigate(companyPaths.opportunities);
    } catch (submitError) {
      console.error(
        "Failed to save opportunity:",
        submitError,
      );
      setError(
        toErrorMessage(
          submitError,
          "Không thể lưu cơ hội thực tập.",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="container-fluid px-0">
        <LoadingState message="Đang tải biểu mẫu cơ hội thực tập..." />
      </div>
    );
  }

  return (
    <div className="container-fluid px-0">
      <PageHeader
        title={
          isEditMode
            ? "Edit Opportunity"
            : "Create Opportunity"
        }
        subtitle="Thiết lập thông tin tuyển thực tập với trải nghiệm nhập liệu rõ ràng, nhanh chóng."
        actions={
          <Link
            to={companyPaths.opportunities}
            className="btn btn-outline-secondary rounded-pill"
          >
            <i className="bi bi-arrow-left me-2" />
            Quay lại danh sách
          </Link>
        }
      />

      <div className="card border-0 shadow-sm rounded-3">
        <div className="card-body p-4 p-lg-5">
          {error ? (
            <div className="alert alert-danger rounded-3 border-0 shadow-sm">
              <i className="bi bi-exclamation-octagon me-2" />
              {error}
            </div>
          ) : null}

          {periodLoadError ? (
            <div className="alert alert-warning rounded-3 border-0 shadow-sm">
              <i className="bi bi-exclamation-triangle me-2" />
              {periodLoadError} Bạn vẫn có thể nhập periodId thủ công.
            </div>
          ) : null}

          <form onSubmit={handleSubmit} noValidate>
            <div className="row g-4">
              <div className="col-12 col-lg-6">
                <label
                  htmlFor="periodId"
                  className="form-label fw-semibold"
                >
                  Kỳ thực tập
                </label>

                {usePeriodSelect ? (
                  <select
                    id="periodId"
                    className={`form-select rounded-3 ${
                      errors.periodId ? "is-invalid" : ""
                    }`}
                    value={periodId}
                    onChange={(event) =>
                      setPeriodId(event.target.value)
                    }
                    disabled={saving}
                  >
                    <option value="">
                      Chọn kỳ thực tập đang mở
                    </option>
                    {selectablePeriods.map((period) => (
                      <option
                        key={period.id}
                        value={period.id}
                      >
                        {period.name} · {formatDateRange(
                          period.internshipStartDate,
                          period.internshipEndDate,
                        )}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id="periodId"
                    type="number"
                    min={1}
                    className={`form-control rounded-3 ${
                      errors.periodId ? "is-invalid" : ""
                    }`}
                    value={periodId}
                    onChange={(event) =>
                      setPeriodId(event.target.value)
                    }
                    disabled={saving}
                    placeholder="Nhập periodId"
                  />
                )}

                {errors.periodId ? (
                  <div className="invalid-feedback d-block">
                    {errors.periodId}
                  </div>
                ) : null}
              </div>

              <div className="col-12 col-lg-6">
                <label
                  htmlFor="status"
                  className="form-label fw-semibold"
                >
                  Trạng thái
                </label>
                <select
                  id="status"
                  className="form-select rounded-3"
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target.value as OpportunityStatus,
                    )
                  }
                  disabled={!isEditMode || saving}
                >
                  <option value="OPEN">Đang mở</option>
                  <option value="CLOSED">Đã đóng</option>
                </select>
                {!isEditMode ? (
                  <div className="form-text">
                    Cơ hội mới mặc định ở trạng thái OPEN.
                  </div>
                ) : null}
              </div>

              <div className="col-12">
                <label
                  htmlFor="position"
                  className="form-label fw-semibold"
                >
                  Vị trí tuyển dụng
                </label>
                <input
                  id="position"
                  type="text"
                  className={`form-control rounded-3 ${
                    errors.position ? "is-invalid" : ""
                  }`}
                  value={position}
                  onChange={(event) =>
                    setPosition(event.target.value)
                  }
                  disabled={saving}
                  placeholder="Ví dụ: Frontend Intern"
                />
                {errors.position ? (
                  <div className="invalid-feedback d-block">
                    {errors.position}
                  </div>
                ) : null}
              </div>

              <div className="col-12">
                <label
                  htmlFor="description"
                  className="form-label fw-semibold"
                >
                  Mô tả công việc
                </label>
                <textarea
                  id="description"
                  className="form-control rounded-3"
                  rows={5}
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  disabled={saving}
                  placeholder="Mô tả nhiệm vụ, phạm vi công việc và môi trường thực tập."
                />
              </div>

              <div className="col-12">
                <label
                  htmlFor="requirements"
                  className="form-label fw-semibold"
                >
                  Yêu cầu ứng viên
                </label>
                <textarea
                  id="requirements"
                  className="form-control rounded-3"
                  rows={4}
                  value={requirements}
                  onChange={(event) =>
                    setRequirements(event.target.value)
                  }
                  disabled={saving}
                  placeholder="Kỹ năng, công cụ và kiến thức cần có."
                />
              </div>

              <div className="col-12 col-lg-6">
                <label
                  htmlFor="location"
                  className="form-label fw-semibold"
                >
                  Địa điểm làm việc
                </label>
                <input
                  id="location"
                  type="text"
                  className="form-control rounded-3"
                  value={location}
                  onChange={(event) =>
                    setLocation(event.target.value)
                  }
                  disabled={saving}
                  placeholder="Ví dụ: Cần Thơ / Hybrid"
                />
              </div>

              <div className="col-12 col-lg-6">
                <label
                  htmlFor="quantity"
                  className="form-label fw-semibold"
                >
                  Số lượng tuyển
                </label>
                <input
                  id="quantity"
                  type="number"
                  min={1}
                  className={`form-control rounded-3 ${
                    errors.quantity ? "is-invalid" : ""
                  }`}
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(event.target.value)
                  }
                  disabled={saving}
                />
                {errors.quantity ? (
                  <div className="invalid-feedback d-block">
                    {errors.quantity}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="d-flex flex-wrap justify-content-end gap-2 mt-4">
              <Link
                to={companyPaths.opportunities}
                className="btn btn-outline-secondary rounded-pill px-4"
              >
                Hủy
              </Link>
              <button
                type="submit"
                className="btn btn-primary rounded-pill px-4"
                disabled={saving}
              >
                <i className="bi bi-check2-circle me-2" />
                {saving
                  ? "Đang lưu..."
                  : isEditMode
                    ? "Cập nhật cơ hội"
                    : "Tạo cơ hội"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OpportunityFormPage;
