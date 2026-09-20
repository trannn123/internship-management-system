import { useEffect, useState } from "react";
import { getCurrentUser } from "../api/user-api";
import { getMyInternships } from "../api/internship-api";
import { Link } from "react-router-dom";

interface UserProfile {
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

function StudentDashboard() {
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
                console.error("Failed to load student dashboard:", error);
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
            <h2>Student Dashboard</h2>

            {user && (
                <div>
                    <h3>Thông tin sinh viên</h3>

                    <p>
                        <strong>Họ và tên:</strong> {user.fullName}
                    </p>

                    <p>
                        <strong>Email:</strong> {user.email}
                    </p>

                    <p>
                        <strong>Mã sinh viên:</strong>{" "}
                        {user.profile?.studentCode ?? "Chưa cập nhật"}
                    </p>

                    <p>
                        <strong>Ngành:</strong>{" "}
                        {user.profile?.major ?? "Chưa cập nhật"}
                    </p>

                    <p>
                        <strong>Lớp:</strong>{" "}
                        {user.profile?.className ?? "Chưa cập nhật"}
                    </p>
                </div>
            )}

            <div>
                <h3>Thực tập của tôi</h3>

                {internships.length === 0 ? (
                    <p>Chưa có đợt thực tập nào.</p>
                ) : (
                    internships.map((internship) => (
                        <div key={internship.id}>
                            <h4>{internship.position}</h4>

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

                            <Link to={`/student/internships/${internship.id}`}>
                                Xem chi tiết
                            </Link>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default StudentDashboard;