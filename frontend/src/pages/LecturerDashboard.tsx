import { useEffect, useState } from "react";
import { getMyInternships } from "../api/internship-api";
import { getCurrentUser } from "../api/user-api";
import type { CurrentUser, Internship, LecturerProfile } from "../types";

function LecturerDashboard() {
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
        console.error("Failed to load lecturer dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return <p>Đang tải dữ liệu...</p>;
  }

  const profile = user?.profile as LecturerProfile | null | undefined;

  return (
    <div>
      <h2>Lecturer Dashboard</h2>

      {user && (
        <div>
          <h3>Thông tin giảng viên</h3>

          <p>
            <strong>Họ và tên:</strong> {user.fullName}
          </p>

          <p>
            <strong>Email:</strong> {user.email}
          </p>

          <p>
            <strong>Mã giảng viên:</strong>{" "}
            {profile?.lecturerCode ?? "Chưa cập nhật"}
          </p>

          <p>
            <strong>Khoa/Bộ môn:</strong>{" "}
            {profile?.department ?? "Chưa cập nhật"}
          </p>

          <p>
            <strong>Số điện thoại:</strong>{" "}
            {profile?.phone ?? "Chưa cập nhật"}
          </p>
        </div>
      )}

      <div>
        <h3>Sinh viên thực tập được phân công</h3>

        {internships.length === 0 ? (
          <p>Chưa có sinh viên thực tập nào.</p>
        ) : (
          internships.map((internship) => (
            <div key={internship.id}>
              <h4>{internship.position}</h4>

              <p>
                <strong>Mã internship:</strong> {internship.id}
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
                <strong>Trạng thái:</strong>{" "}
                {internship.status}
              </p>

              <p>
                <strong>Thời gian:</strong>{" "}
                {internship.startDate} → {internship.endDate}
              </p>

              <p>
                <strong>Mô tả:</strong>{" "}
                {internship.description}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default LecturerDashboard;