import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  Link,
  NavLink,
  useLocation,
} from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import type { AppRole } from "../../types";

interface MainLayoutProps {
  children: ReactNode;
}

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const ROLE_LABELS: Record<AppRole, string> = {
  STUDENT: "Sinh viên",
  COMPANY: "Doanh nghiệp",
  LECTURER: "Giảng viên",
  ADMIN: "Quản trị viên",
};

const NAV_ITEMS: Record<AppRole, NavItem[]> = {
  STUDENT: [
    { to: "/", label: "Tổng quan", icon: "bi-grid" },
    { to: "/student/opportunities", label: "Cơ hội thực tập", icon: "bi-briefcase" },
    { to: "/student/registrations", label: "Đăng ký của tôi", icon: "bi-clipboard-check" },
    { to: "/profile", label: "Hồ sơ", icon: "bi-person-circle" },
  ],
  COMPANY: [
    { to: "/", label: "Tổng quan", icon: "bi-grid" },
    { to: "/company/opportunities", label: "Cơ hội thực tập", icon: "bi-briefcase" },
    { to: "/company/registrations", label: "Đăng ký", icon: "bi-clipboard-check" },
    { to: "/company/work-plans", label: "Kế hoạch thực tập", icon: "bi-diagram-3" },
    { to: "/company/tasks", label: "Công việc", icon: "bi-list-task" },
    { to: "/company/logs", label: "Nhật ký thực tập sinh", icon: "bi-journal-text" },
    { to: "/company/evaluations", label: "Đánh giá", icon: "bi-clipboard-data" },
  ],
  LECTURER: [
    { to: "/", label: "Tổng quan", icon: "bi-grid" },
    { to: "/lecturer/periods", label: "Kỳ được phân công", icon: "bi-calendar3" },
    { to: "/lecturer/registrations/pending", label: "Đăng ký chờ duyệt", icon: "bi-hourglass-split" },
    { to: "/lecturer/students", label: "Sinh viên phụ trách", icon: "bi-mortarboard" },
  ],
  ADMIN: [
    { to: "/", label: "Tổng quan", icon: "bi-grid" },
    { to: "/admin/periods", label: "Kỳ thực tập", icon: "bi-calendar3" },
    { to: "/users", label: "Quản lý người dùng", icon: "bi-people-fill" },
  ],
};

function MainLayout({ children }: MainLayoutProps) {
  const { logout, role, fullName: displayName } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const navItems = useMemo(() => {
    if (role === "UNKNOWN") {
      return [];
    }

    return NAV_ITEMS[role];
  }, [role]);

  const roleLabel = role === "UNKNOWN" ? "Chưa xác định" : ROLE_LABELS[role];

  const sidebarContent = (
    <div className="d-flex flex-column h-100 p-3 p-lg-4">
      <nav className="nav nav-pills flex-column gap-2 sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `nav-link d-flex align-items-center gap-3 px-3 py-2 ${
                isActive ? "active shadow-sm" : "text-secondary"
              }`
            }
          >
            <i className={`bi ${item.icon} fs-5`} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="min-vh-100 bg-body-tertiary">
      <header className="navbar navbar-light bg-white text-dark sticky-top shadow-sm border-bottom">
        <div className="container-fluid px-3 px-lg-4">
          <div className="d-flex align-items-center gap-2">
            <button
              type="button"
              className="btn btn-outline-secondary d-lg-none border-0 px-2"
              aria-label="Mở điều hướng"
              onClick={() => setSidebarOpen(true)}
            >
              <i className="bi bi-list fs-4 text-dark" />
            </button>
            <Link to="/" className="navbar-brand mb-0 text-dark d-flex align-items-center gap-2">
              <i className="bi bi-mortarboard-fill fs-3" />
              <span className="fw-bold">Hệ Thống Quản Lý Thực Tập CIT</span>
            </Link>
          </div>

          <div className="position-relative ms-auto">
            <button
              type="button"
              className="btn btn-light border d-flex align-items-center gap-2 text-dark"
              onClick={() => setUserMenuOpen((open) => !open)}
            >
              <span className="text-start d-none d-sm-block">
                <span className="d-block fw-semibold lh-1 text-dark">{displayName}</span>
                <small className="text-secondary">{roleLabel}</small>
              </span>
              <i className="bi bi-chevron-down small text-dark" />
            </button>

            <div
              className={`dropdown-menu dropdown-menu-end mt-2 ${
                userMenuOpen ? "show" : ""
              }`}
            >
              <div className="px-3 py-2 border-bottom">
                <p className="fw-semibold mb-1">{displayName}</p>
                <p className="text-secondary small mb-0">{roleLabel}</p>
              </div>
              <button
                type="button"
                className="dropdown-item"
                onClick={() => logout()}
              >
                <i className="bi bi-box-arrow-right me-2" />
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="d-flex app-shell">
        <aside
          className="d-none d-lg-flex flex-column bg-white border-end flex-shrink-0"
          style={{ width: "280px", minHeight: "calc(100vh - 56px)" }}
        >
          {sidebarContent}
        </aside>

        <div
          className={`offcanvas offcanvas-start ${sidebarOpen ? "show" : ""}`}
          tabIndex={-1}
          style={{ visibility: sidebarOpen ? "visible" : "hidden" }}
        >
          <div className="offcanvas-header border-bottom">
            <h2 className="offcanvas-title h5 mb-0">Danh mục</h2>
            <button
              type="button"
              className="btn-close"
              aria-label="Đóng"
              onClick={() => setSidebarOpen(false)}
            />
          </div>
          <div className="offcanvas-body p-0">{sidebarContent}</div>
        </div>

        {sidebarOpen ? (
          <div
            className="offcanvas-backdrop fade show d-lg-none"
            onClick={() => setSidebarOpen(false)}
          />
        ) : null}

        <main className="flex-grow-1 p-3 p-lg-4">{children}</main>
      </div>
    </div>
  );
}

export default MainLayout;
