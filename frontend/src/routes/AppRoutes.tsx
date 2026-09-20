import { Routes, Route, Navigate } from "react-router-dom";

import StudentDashboard from "../pages/StudentDashboard";
import CompanyDashboard from "../pages/CompanyDashboard";
import LecturerDashboard from "../pages/LecturerDashboard";
import AdminDashboard from "../pages/AdminDashBoard";
import UsersPage from "../pages/UsersPage";
import ProfilePage from "../pages/ProfilePage";
import CreateInternshipPage from "../pages/CreateInternshipPage";
import InternshipDetailPage from "../pages/InternshipDetailPage";

import keycloak from "../keycloak";

function AppRoutes() {
    const roles =
        keycloak.tokenParsed?.realm_access?.roles ?? [];

    const role =
        roles.find((item) =>
            ["STUDENT", "COMPANY", "LECTURER", "ADMIN"].includes(item)
        ) ?? "UNKNOWN";

    return (
        <Routes>
            <Route
                path="/"
                element={<DashboardByRole role={role} />}
            />

            <Route
                path="/student"
                element={
                    role === "STUDENT" ? (
                        <StudentDashboard />
                    ) : (
                        <Navigate to="/" replace />
                    )
                }
            />

            <Route
                path="/company"
                element={
                    role === "COMPANY" ? (
                        <CompanyDashboard />
                    ) : (
                        <Navigate to="/" replace />
                    )
                }
            />

            <Route
                path="/lecturer"
                element={
                    role === "LECTURER" ? (
                        <LecturerDashboard />
                    ) : (
                        <Navigate to="/" replace />
                    )
                }
            />

            <Route
                path="/admin"
                element={
                    role === "ADMIN" ? (
                        <AdminDashboard />
                    ) : (
                        <Navigate to="/" replace />
                    )
                }
            />

            <Route
                path="/users"
                element={
                    role === "ADMIN" ? (
                        <UsersPage />
                    ) : (
                        <Navigate to="/" replace />
                    )
                }
            />

            <Route
                path="/profile"
                element={
                    role === "STUDENT" ? (
                        <ProfilePage />
                    ) : (
                        <Navigate to="/" replace />
                    )
                }
            />

            <Route
                path="/student/internships/create"
                element={
                    role === "STUDENT" ? (
                        <CreateInternshipPage />
                    ) : (
                        <Navigate to="/" replace />
                    )
                }
            />

            <Route
                path="/student/internships/:id"
                element={
                    role === "STUDENT" ? (
                        <InternshipDetailPage />
                    ) : (
                        <Navigate to="/" replace />
                    )
                }
            />

            <Route
                path="*"
                element={<h2>Không tìm thấy trang</h2>}
            />
        </Routes>
    );
}

interface DashboardByRoleProps {
    role: string;
}

function DashboardByRole({
    role,
}: DashboardByRoleProps) {
    switch (role) {
        case "STUDENT":
            return <StudentDashboard />;

        case "COMPANY":
            return <CompanyDashboard />;

        case "LECTURER":
            return <LecturerDashboard />;

        case "ADMIN":
            return <AdminDashboard />;

        default:
            return (
                <div>
                    <h2>Không xác định được vai trò</h2>
                    <p>Vui lòng kiểm tra tài khoản Keycloak.</p>
                </div>
            );
    }
}

export default AppRoutes;