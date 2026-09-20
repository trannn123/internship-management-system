import { useEffect, useState } from "react";
import { getCurrentUser } from "../api/user-api";
import { getMyInternships } from "../api/internship-api";

interface CurrentUser {
  id: number;
  keycloakUserId: string;
  fullName: string;
  email: string;
  role: string;
  profile: null;
}

interface Internship {
  id: number;
  studentId: number;
  companyId: number | null;
  lecturerId: number | null;
  position: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
}

function AdminDashboard() {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [userData, internshipData] = await Promise.all([
          getCurrentUser(),
          getMyInternships(),
        ]);

        setUser(userData);
        setInternships(internshipData);
      } catch (error) {
        console.error("Failed to load admin dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return <p>Đang tải dữ liệu...</p>;
  }

  return (
    <div>
      <h2>Admin Dashboard</h2>

      {user && (
        <div>
          <h3>Thông tin quản trị viên</h3>

          <p>
            <strong>Họ và tên:</strong> {user.fullName}
          </p>

          <p>
            <strong>Email:</strong> {user.email}
          </p>

          <p>
            <strong>Vai trò:</strong> {user.role}
          </p>
        </div>
      )}

      <div>
        <h3>Quản lý thực tập</h3>

        {internships.length === 0 ? (
          <p>Chưa có dữ liệu thực tập.</p>
        ) : (
          internships.map((internship) => (
            <div key={internship.id}>
              <h4>{internship.position}</h4>

              <p>
                <strong>Mã internship:</strong>{" "}
                {internship.id}
              </p>

              <p>
                <strong>Mã sinh viên:</strong>{" "}
                {internship.studentId}
              </p>

              <p>
                <strong>Mã doanh nghiệp:</strong>{" "}
                {internship.companyId ?? "Chưa có"}
              </p>

              <p>
                <strong>Mã giảng viên:</strong>{" "}
                {internship.lecturerId ?? "Chưa có"}
              </p>

              <p>
                <strong>Trạng thái:</strong>{" "}
                {internship.status}
              </p>

              <p>
                <strong>Thời gian:</strong>{" "}
                {internship.startDate} → {internship.endDate}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;