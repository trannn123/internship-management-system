import { useEffect, useState } from "react";
import {
  getCurrentUser,
  updateStudentProfile,
} from "../api/user-api";

interface StudentProfile {
  id: number;
  studentCode?: string;
  major?: string;
  className?: string;
  phone?: string;
}

interface CurrentUser {
  id: number;
  keycloakUserId: string;
  fullName: string;
  email: string;
  role: string;
  profile: StudentProfile | null;
}

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

        if (data.profile) {
          setStudentCode(data.profile.studentCode ?? "");
          setMajor(data.profile.major ?? "");
          setClassName(data.profile.className ?? "");
          setPhone(data.profile.phone ?? "");
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
        setError("Không thể tải thông tin hồ sơ.");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
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
    } catch (error) {
      console.error("Failed to update profile:", error);
      setError("Không thể cập nhật hồ sơ.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>Đang tải hồ sơ...</p>;
  }

  if (!user) {
    return <p>Không tìm thấy thông tin người dùng.</p>;
  }

  if (user.role !== "STUDENT") {
    return (
      <div>
        <h2>Hồ sơ</h2>
        <p>
          Trang hồ sơ sinh viên hiện chỉ hỗ trợ tài khoản STUDENT.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2>Hồ sơ sinh viên</h2>

      <div>
        <p>
          <strong>Họ và tên:</strong> {user.fullName}
        </p>

        <p>
          <strong>Email:</strong> {user.email}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="studentCode">
            Mã sinh viên
          </label>

          <input
            id="studentCode"
            type="text"
            value={studentCode}
            onChange={(event) =>
              setStudentCode(event.target.value)
            }
          />
        </div>

        <div>
          <label htmlFor="major">
            Ngành
          </label>

          <input
            id="major"
            type="text"
            value={major}
            onChange={(event) =>
              setMajor(event.target.value)
            }
          />
        </div>

        <div>
          <label htmlFor="className">
            Lớp
          </label>

          <input
            id="className"
            type="text"
            value={className}
            onChange={(event) =>
              setClassName(event.target.value)
            }
          />
        </div>

        <div>
          <label htmlFor="phone">
            Số điện thoại
          </label>

          <input
            id="phone"
            type="text"
            value={phone}
            onChange={(event) =>
              setPhone(event.target.value)
            }
          />
        </div>

        {message && <p>{message}</p>}

        {error && <p>{error}</p>}

        <button type="submit" disabled={saving}>
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </form>
    </div>
  );
}

export default ProfilePage;