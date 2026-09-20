import { Navigate, Route, Routes } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";
import UsersPage from "../pages/UsersPage";
import ProfilePage from "../pages/ProfilePage";
import CreateInternshipPage from "../pages/CreateInternshipPage";
import InternshipDetailPage from "../pages/InternshipDetailPage";
import type { UserRole } from "../types";
import {
  AdminOverviewPage,
  InternshipPeriodsListPage,
  InternshipPeriodFormPage,
  InternshipPeriodDetailPage,
} from "../pages/admin";
import {
  CompanyOverviewPage,
  OpportunitiesListPage as CompanyOpportunitiesListPage,
  OpportunityFormPage,
  RegistrationsPage as CompanyRegistrationsPage,
  WorkPlansPage,
  TasksPage,
  InternLogsPage,
  EvaluationsPage as CompanyEvaluationsPage,
} from "../pages/company";
import {
  StudentOverviewPage,
  OpportunitiesBrowsePage,
  MyRegistrationsPage,
  InternshipWorkspacePage,
} from "../pages/student";
import {
  LecturerOverviewPage,
  AssignedPeriodsPage,
  PendingRegistrationsPage,
  AssignedStudentsPage,
  StudentProgressPage,
} from "../pages/lecturer";

function RoleRoute({
  allow,
  role,
  children,
}: {
  allow: UserRole;
  role: UserRole;
  children: React.ReactNode;
}) {
  return role === allow ? <>{children}</> : <Navigate to="/" replace />;
}

function AppRoutes() {
  const { role } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<DashboardByRole role={role} />} />

      {/* Admin */}
      <Route
        path="/admin"
        element={<RoleRoute allow="ADMIN" role={role}><AdminOverviewPage /></RoleRoute>}
      />
      <Route
        path="/admin/periods"
        element={<RoleRoute allow="ADMIN" role={role}><InternshipPeriodsListPage /></RoleRoute>}
      />
      <Route
        path="/admin/periods/new"
        element={<RoleRoute allow="ADMIN" role={role}><InternshipPeriodFormPage /></RoleRoute>}
      />
      <Route
        path="/admin/periods/:id/edit"
        element={<RoleRoute allow="ADMIN" role={role}><InternshipPeriodFormPage /></RoleRoute>}
      />
      <Route
        path="/admin/periods/:id"
        element={<RoleRoute allow="ADMIN" role={role}><InternshipPeriodDetailPage /></RoleRoute>}
      />
      <Route
        path="/users"
        element={<RoleRoute allow="ADMIN" role={role}><UsersPage /></RoleRoute>}
      />

      {/* Company */}
      <Route
        path="/company"
        element={<RoleRoute allow="COMPANY" role={role}><CompanyOverviewPage /></RoleRoute>}
      />
      <Route
        path="/company/opportunities"
        element={<RoleRoute allow="COMPANY" role={role}><CompanyOpportunitiesListPage /></RoleRoute>}
      />
      <Route
        path="/company/opportunities/new"
        element={<RoleRoute allow="COMPANY" role={role}><OpportunityFormPage /></RoleRoute>}
      />
      <Route
        path="/company/opportunities/:id/edit"
        element={<RoleRoute allow="COMPANY" role={role}><OpportunityFormPage /></RoleRoute>}
      />
      <Route
        path="/company/registrations"
        element={<RoleRoute allow="COMPANY" role={role}><CompanyRegistrationsPage /></RoleRoute>}
      />
      <Route
        path="/company/work-plans"
        element={<RoleRoute allow="COMPANY" role={role}><WorkPlansPage /></RoleRoute>}
      />
      <Route
        path="/company/tasks"
        element={<RoleRoute allow="COMPANY" role={role}><TasksPage /></RoleRoute>}
      />
      <Route
        path="/company/logs"
        element={<RoleRoute allow="COMPANY" role={role}><InternLogsPage /></RoleRoute>}
      />
      <Route
        path="/company/evaluations"
        element={<RoleRoute allow="COMPANY" role={role}><CompanyEvaluationsPage /></RoleRoute>}
      />

      {/* Student */}
      <Route
        path="/student"
        element={<RoleRoute allow="STUDENT" role={role}><StudentOverviewPage /></RoleRoute>}
      />
      <Route
        path="/student/opportunities"
        element={<RoleRoute allow="STUDENT" role={role}><OpportunitiesBrowsePage /></RoleRoute>}
      />
      <Route
        path="/student/registrations"
        element={<RoleRoute allow="STUDENT" role={role}><MyRegistrationsPage /></RoleRoute>}
      />
      <Route
        path="/student/workspace/:id"
        element={<RoleRoute allow="STUDENT" role={role}><InternshipWorkspacePage /></RoleRoute>}
      />
      <Route
        path="/profile"
        element={<RoleRoute allow="STUDENT" role={role}><ProfilePage /></RoleRoute>}
      />

      {/* Legacy old-workflow pages, kept for backward compatibility */}
      <Route
        path="/student/internships/create"
        element={<RoleRoute allow="STUDENT" role={role}><CreateInternshipPage /></RoleRoute>}
      />
      <Route
        path="/student/internships/:id"
        element={<RoleRoute allow="STUDENT" role={role}><InternshipDetailPage /></RoleRoute>}
      />

      {/* Lecturer */}
      <Route
        path="/lecturer"
        element={<RoleRoute allow="LECTURER" role={role}><LecturerOverviewPage /></RoleRoute>}
      />
      <Route
        path="/lecturer/periods"
        element={<RoleRoute allow="LECTURER" role={role}><AssignedPeriodsPage /></RoleRoute>}
      />
      <Route
        path="/lecturer/registrations/pending"
        element={<RoleRoute allow="LECTURER" role={role}><PendingRegistrationsPage /></RoleRoute>}
      />
      <Route
        path="/lecturer/students"
        element={<RoleRoute allow="LECTURER" role={role}><AssignedStudentsPage /></RoleRoute>}
      />
      <Route
        path="/lecturer/students/:id"
        element={<RoleRoute allow="LECTURER" role={role}><StudentProgressPage /></RoleRoute>}
      />

      <Route path="*" element={<h2>Không tìm thấy trang</h2>} />
    </Routes>
  );
}

interface DashboardByRoleProps {
  role: UserRole;
}

function DashboardByRole({ role }: DashboardByRoleProps) {
  switch (role) {
    case "STUDENT":
      return <StudentOverviewPage />;

    case "COMPANY":
      return <CompanyOverviewPage />;

    case "LECTURER":
      return <LecturerOverviewPage />;

    case "ADMIN":
      return <AdminOverviewPage />;

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