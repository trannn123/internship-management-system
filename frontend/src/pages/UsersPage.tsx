import { useEffect, useState } from "react";
import { getAllUsers } from "../api/user-api";

interface User {
  id: number;
  keycloakUserId: string;
  fullName: string;
  email: string;
}

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

  if (loading) {
    return <p>Đang tải danh sách người dùng...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2>Quản lý người dùng</h2>

      <p>
        Tài khoản và vai trò được quản lý trên Keycloak.
      </p>

      {users.length === 0 ? (
        <p>Chưa có người dùng nào.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ và tên</th>
              <th>Email</th>
              <th>Keycloak User ID</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.fullName}</td>
                <td>{user.email}</td>
                <td>{user.keycloakUserId}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default UsersPage;