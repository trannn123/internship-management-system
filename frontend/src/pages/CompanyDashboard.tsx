import { useEffect, useState } from "react";
import { getCurrentUser } from "../api/user-api";
import { getMyInternships } from "../api/internship-api";

interface UserProfile {
  id: number;
  companyName?: string;
  taxCode?: string;
  address?: string;
  phone?: string;
}

interface CurrentUser {
  id: number;
  keycloakUserId: string;
  fullName: string;
  email: string;
  role: string;
  profile: UserProfile | null;
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

function CompanyDashboard() {
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
        console.error("Failed to load company dashboard:", error);
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
      <h2>Company Dashboard</h2>

      {user && (
        <div>
          <h3>Thông tin doanh nghiệp</h3>

          <p>
            <strong>Người đại diện:</strong> {user.fullName}
          </p>

          <p>
            <strong>Email:</strong> {user.email}
          </p>

          <p>
            <strong>Tên doanh nghiệp:</strong>{" "}
            {user.profile?.companyName ?? "Chưa cập nhật"}
          </p>

          <p>
            <strong>Mã số thuế:</strong>{" "}
            {user.profile?.taxCode ?? "Chưa cập nhật"}
          </p>

          <p>
            <strong>Địa chỉ:</strong>{" "}
            {user.profile?.address ?? "Chưa cập nhật"}
          </p>

          <p>
            <strong>Số điện thoại:</strong>{" "}
            {user.profile?.phone ?? "Chưa cập nhật"}
          </p>
        </div>
      )}

      <div>
        <h3>Thực tập sinh của doanh nghiệp</h3>

        {internships.length === 0 ? (
          <p>Chưa có thực tập sinh nào.</p>
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

export default CompanyDashboard;