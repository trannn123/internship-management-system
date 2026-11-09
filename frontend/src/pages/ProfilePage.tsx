
import { useEffect, useState, type FormEvent } from "react";
import {
  getCurrentUser,
  updateStudentProfile,
  updateLecturerProfile,
  updateCompanyProfile,
} from "../api/user-api";
import EmptyState from "../components/ui/EmptyState";
import LoadingState from "../components/ui/LoadingState";
import PageHeader from "../components/ui/PageHeader";
import type {
  CurrentUser,
  StudentProfile,
  LecturerProfile,
  CompanyProfile,
} from "../types";

type ProfileForm = {
  studentCode: string;
  major: string;
  className: string;
  lecturerCode: string;
  department: string;
  companyName: string;
  taxCode: string;
  address: string;
  phone: string;
};

const emptyForm: ProfileForm = {
  studentCode: "",
  major: "",
  className: "",
  lecturerCode: "",
  department: "",
  companyName: "",
  taxCode: "",
  address: "",
  phone: "",
};

function ProfilePage() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function populateForm(data: CurrentUser) {
    const profile = data.profile;

    if (data.role === "STUDENT") {
      const student = profile as StudentProfile | null;
      setForm({
        ...emptyForm,
        studentCode: student?.studentCode ?? "",
        major: student?.major ?? "",
        className: student?.className ?? "",
        phone: student?.phone ?? "",
      });
    } else if (data.role === "LECTURER") {
      const lecturer = profile as LecturerProfile | null;
      setForm({
        ...emptyForm,
        lecturerCode: lecturer?.lecturerCode ?? "",
        department: lecturer?.department ?? "",
        phone: lecturer?.phone ?? "",
      });
    } else if (data.role === "COMPANY") {
      const company = profile as CompanyProfile | null;
      setForm({
        ...emptyForm,
        companyName: company?.companyName ?? "",
        taxCode: company?.taxCode ?? "",
        address: company?.address ?? "",
        phone: company?.phone ?? "",
      });
    }
  }

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getCurrentUser();
        setUser(data);
        populateForm(data);
      } catch (loadError) {
        console.error("Failed to load profile:", loadError);
        setError("Không thể tải thông tin hồ sơ.");
      } finally {
        setLoading(false);
      }
    }

    void loadProfile();
  }, []);

  function updateField(field: keyof ProfileForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user) return;

    setSaving(true);
    setMessage("");
    setError("");

    try {
      let updatedUser: CurrentUser;

      if (user.role === "STUDENT") {
        updatedUser = await updateStudentProfile({
          studentCode: form.studentCode,
          major: form.major,
          className: form.className,
          phone: form.phone,
        });
      } else if (user.role === "LECTURER") {
        updatedUser = await updateLecturerProfile({
          lecturerCode: form.lecturerCode,
          department: form.department,
          phone: form.phone,
        });
      } else if (user.role === "COMPANY") {
        updatedUser = await updateCompanyProfile({
          companyName: form.companyName,
          taxCode: form.taxCode,
          address: form.address,
          phone: form.phone,
        });
      } else {
        setError("Vai trò này chưa hỗ trợ cập nhật hồ sơ.");
        return;
      }

      setUser(updatedUser);
      populateForm(updatedUser);
      setMessage("Cập nhật hồ sơ thành công.");
    } catch (submitError) {
      console.error("Failed to update profile:", submitError);
      setError("Không thể cập nhật hồ sơ.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="container-fluid px-0">
        <LoadingState message="Đang tải hồ sơ..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container-fluid px-0">
        <EmptyState
          title="Không tìm thấy thông tin người dùng"
          description="Vui lòng đăng nhập lại để tiếp tục."
          icon="bi-person-x"
        />
      </div>
    );
  }

  const roleConfig =
    user.role === "STUDENT"
      ? {
          title: "Hồ sơ sinh viên",
          subtitle: "Cập nhật thông tin cá nhân và học tập của bạn.",
          label: "Sinh viên",
          icon: "bi-mortarboard",
          section: "Thông tin học tập",
        }
      : user.role === "LECTURER"
        ? {
            title: "Hồ sơ giảng viên",
            subtitle: "Cập nhật thông tin giảng viên của bạn.",
            label: "Giảng viên",
            icon: "bi-person-workspace",
            section: "Thông tin giảng viên",
          }
        : user.role === "COMPANY"
          ? {
              title: "Hồ sơ doanh nghiệp",
              subtitle: "Cập nhật thông tin doanh nghiệp của bạn.",
              label: "Doanh nghiệp",
              icon: "bi-building",
              section: "Thông tin doanh nghiệp",
            }
          : {
              title: "Hồ sơ cá nhân",
              subtitle: "Thông tin tài khoản của bạn.",
              label: user.role,
              icon: "bi-person",
              section: "Thông tin tài khoản",
            };

  const fields: {
    key: keyof ProfileForm;
    label: string;
    type?: string;
  }[] =
    user.role === "STUDENT"
      ? [
          { key: "studentCode", label: "Mã sinh viên" },
          { key: "className", label: "Lớp" },
          { key: "major", label: "Ngành" },
          { key: "phone", label: "Số điện thoại", type: "tel" },
        ]
      : user.role === "LECTURER"
        ? [
            { key: "lecturerCode", label: "Mã giảng viên" },
            { key: "department", label: "Khoa/Bộ môn" },
            { key: "phone", label: "Số điện thoại", type: "tel" },
          ]
        : user.role === "COMPANY"
          ? [
              { key: "companyName", label: "Tên doanh nghiệp" },
              { key: "taxCode", label: "Mã số thuế" },
              { key: "address", label: "Địa chỉ" },
              { key: "phone", label: "Số điện thoại", type: "tel" },
            ]
          : [];

  return (
    <div className="container-fluid px-0">
      <PageHeader
        title={roleConfig.title}
        subtitle={roleConfig.subtitle}
      />

      <div className="row g-4">
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-body p-4 text-center">
              <div
                className="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center mb-3"
                style={{
                  width: 88,
                  height: 88,
                  fontSize: "2rem",
                }}
              >
                <i className="bi bi-person" />
              </div>

              <h2 className="h5 mb-1">{user.fullName}</h2>
              <p className="text-secondary mb-3">{user.email}</p>

              <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2">
                <i className={`bi ${roleConfig.icon} me-1`} />
                {roleConfig.label}
              </span>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body p-4">
              <h3 className="h5 mb-3">{roleConfig.section}</h3>

              {message && (
                <div
                  className="alert alert-success border-0 shadow-sm rounded-3"
                  role="alert"
                >
                  <i className="bi bi-check-circle me-2" />
                  {message}
                </div>
              )}

              {error && (
                <div
                  className="alert alert-danger border-0 shadow-sm rounded-3"
                  role="alert"
                >
                  <i className="bi bi-exclamation-octagon me-2" />
                  {error}
                </div>
              )}

              {fields.length > 0 ? (
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    {fields.map((field) => (
                      <div
                        className="col-12 col-md-6"
                        key={field.key}
                      >
                        <label
                          htmlFor={field.key}
                          className="form-label"
                        >
                          {field.label}
                        </label>

                        <input
                          id={field.key}
                          type={field.type ?? "text"}
                          className="form-control"
                          value={form[field.key]}
                          onChange={(event) =>
                            updateField(
                              field.key,
                              event.target.value,
                            )
                          }
                          disabled={saving}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="d-flex justify-content-end mt-4">
                    <button
                      type="submit"
                      className="btn btn-primary rounded-pill px-4"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          />
                          Đang lưu...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check2-circle me-2" />
                          Lưu thay đổi
                        </>
                      )}
                    </button>
                  </div>
                </form>
              ) : (
                <EmptyState
                  title="Chưa hỗ trợ cập nhật hồ sơ"
                  description="Vai trò này hiện chưa có biểu mẫu cập nhật."
                  icon="bi-person"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
