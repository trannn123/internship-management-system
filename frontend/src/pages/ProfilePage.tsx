import { useEffect, useState } from "react";
import {
  getCurrentUser,
  updateStudentProfile,
} from "../api/user-api";
import EmptyState from "../components/ui/EmptyState";
import LoadingState from "../components/ui/LoadingState";
import PageHeader from "../components/ui/PageHeader";
import type { CurrentUser, StudentProfile } from "../types";

function ProfilePage() {
  const [user, setUser] = useState<CurrentUser | null>(null);

  const [studentCode, setStudentCode] = useState("");
  const [major, setMajor] = useState("");
  const [className, setClassName] = useState("");
  const [phone, setPhone] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await getCurrentUser();

        setUser(data);

        const profile = data.profile as StudentProfile | null;
        if (profile) {
          setStudentCode(profile.studentCode ?? "");
          setMajor(profile.major ?? "");
          setClassName(profile.className ?? "");
          setPhone(profile.phone ?? "");
        }
      } catch (loadError) {
        console.error("Failed to load profile:", loadError);
        setError("Không thể tải thông tin hồ sơ.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const updatedUser = await updateStudentProfile({
        studentCode,
        major,
        className,
        phone,
      });

      setUser(updatedUser);
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

  if (user.role !== "STUDENT") {
    return (
      <div className="container-fluid px-0">
        <PageHeader title="Hồ sơ cá nhân" />
        <EmptyState
          title="Trang hồ sơ sinh viên"
          description="Trang này hiện chỉ hỗ trợ tài khoản STUDENT."
          icon="bi-mortarboard"
        />
      </div>
    );
  }

  return (
    <div className="container-fluid px-0">
      <PageHeader
        title="Hồ sơ sinh viên"
        subtitle="Cập nhật thông tin cá nhân và học tập của bạn."
      />

      <div className="row g-4">
        <div className="col-12 col-lg-4">
          <div className="card border-0 shadow-sm rounded-3 h-100">
            <div className="card-body p-4 text-center">
              <div
                className="rounded-circle bg-primary-subtle text-primary d-inline-flex align-items-center justify-content-center mb-3"
                style={{ width: 88, height: 88, fontSize: "2rem" }}
              >
                <i className="bi bi-person" />
              </div>
              <h2 className="h5 mb-1">{user.fullName}</h2>
              <p className="text-secondary mb-3">{user.email}</p>
              <span className="badge bg-primary-subtle text-primary rounded-pill px-3 py-2">
                <i className="bi bi-mortarboard me-1" />
                Sinh viên
              </span>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body p-4">
              <h3 className="h5 mb-3">Thông tin học tập</h3>

              {message ? (
                <div className="alert alert-success border-0 shadow-sm rounded-3" role="alert">
                  <i className="bi bi-check-circle me-2" />
                  {message}
                </div>
              ) : null}

              {error ? (
                <div className="alert alert-danger border-0 shadow-sm rounded-3" role="alert">
                  <i className="bi bi-exclamation-octagon me-2" />
                  {error}
                </div>
              ) : null}

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label htmlFor="studentCode" className="form-label">
                      Mã sinh viên
                    </label>
                    <input
                      id="studentCode"
                      type="text"
                      className="form-control"
                      value={studentCode}
                      onChange={(event) =>
                        setStudentCode(event.target.value)
                      }
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label htmlFor="className" className="form-label">
                      Lớp
                    </label>
                    <input
                      id="className"
                      type="text"
                      className="form-control"
                      value={className}
                      onChange={(event) =>
                        setClassName(event.target.value)
                      }
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label htmlFor="major" className="form-label">
                      Ngành
                    </label>
                    <input
                      id="major"
                      type="text"
                      className="form-control"
                      value={major}
                      onChange={(event) =>
                        setMajor(event.target.value)
                      }
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label htmlFor="phone" className="form-label">
                      Số điện thoại
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      className="form-control"
                      value={phone}
                      onChange={(event) =>
                        setPhone(event.target.value)
                      }
                    />
                  </div>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;