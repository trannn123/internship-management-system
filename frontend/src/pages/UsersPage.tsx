import { useEffect, useState } from "react";
import { getAllUsers } from "../api/user-api";
import DataTable, { type DataTableColumn } from "../components/ui/DataTable";
import PageHeader from "../components/ui/PageHeader";
import type { User } from "../types";

function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUsers() {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (error) {
        console.error("Failed to load users:", error);
        setError("Không thể tải danh sách người dùng.");
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  const columns: DataTableColumn<User>[] = [
    {
      key: "id",
      header: "ID",
      className: "text-secondary",
      render: (row) => `#${row.id}`,
    },
    {
      key: "fullName",
      header: "Họ và tên",
      render: (row) => <span className="fw-semibold">{row.fullName}</span>,
    },
    {
      key: "email",
      header: "Email",
    },
    {
      key: "keycloakUserId",
      header: "Keycloak User ID",
      className: "text-secondary small",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Quản lý người dùng"
        subtitle="Tài khoản và vai trò được quản lý trên Keycloak."
      />

      {error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : (
        <DataTable
          columns={columns}
          rows={users}
          rowKey={(row) => row.id}
          loading={loading}
          emptyTitle="Chưa có người dùng nào"
          emptyDescription="Người dùng sẽ xuất hiện ở đây sau khi đăng nhập lần đầu qua Keycloak."
        />
      )}
    </div>
  );
}

export default UsersPage;