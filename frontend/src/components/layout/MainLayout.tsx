import { ReactNode } from "react";
import { Link } from "react-router-dom";
import keycloak from "../../keycloak";

interface MainLayoutProps {
    children: ReactNode;
}

function MainLayout({ children }: MainLayoutProps) {
    const username =
        keycloak.tokenParsed?.preferred_username ?? "User";

    const roles =
        keycloak.tokenParsed?.realm_access?.roles ?? [];

    const role =
        roles.find((item) =>
            ["STUDENT", "COMPANY", "LECTURER", "ADMIN"].includes(item)
        ) ?? "UNKNOWN";

    function renderMenu() {
        switch (role) {
            case "STUDENT":
                return (
                    <nav>
                        <Link to="/">Dashboard</Link>
                        <Link to="/student">Thực tập của tôi</Link>
                        <Link to="/internship-logs">Nhật ký thực tập</Link>
                        <Link to="/profile">Hồ sơ</Link>
                        <Link to="/student/internships/create">
                            Đăng ký thực tập
                        </Link>
                    </nav>
                );

            case "COMPANY":
                return (
                    <nav>
                        <Link to="/">Dashboard</Link>
                        <Link to="/company">Thực tập sinh</Link>
                        <Link to="/work-plans">Kế hoạch thực tập</Link>
                        <Link to="/evaluations">Đánh giá</Link>
                        <Link to="/profile">Hồ sơ</Link>
                    </nav>
                );

            case "LECTURER":
                return (
                    <nav>
                        <Link to="/">Dashboard</Link>
                        <Link to="/lecturer">Sinh viên thực tập</Link>
                        <Link to="/evaluations">Đánh giá</Link>
                        <Link to="/profile">Hồ sơ</Link>
                    </nav>
                );

            case "ADMIN":
                return (
                    <nav>
                        <Link to="/">Dashboard</Link>
                        <Link to="/admin">Quản lý hệ thống</Link>
                        <Link to="/users">Quản lý người dùng</Link>
                        <Link to="/internships">Quản lý thực tập</Link>
                    </nav>
                );

            default:
                return null;
        }
    }

    return (
        <div>
            <header>
                <h1>Internship Management</h1>

                <div>
                    <div>{username}</div>
                    <div>{role}</div>

                    <button onClick={() => keycloak.logout()}>
                        Logout
                    </button>
                </div>
            </header>

            {renderMenu()}

            <main>{children}</main>
        </div>
    );
}

export default MainLayout;