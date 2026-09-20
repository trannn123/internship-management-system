import { useEffect, useState } from "react";
import keycloak from "./keycloak";
import { apiFetch } from "./api/api-client";

function App() {
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const data = await apiFetch("/api/users/me");
        setUserData(data);
      } catch (err) {
        console.error(err);
        setError("Không thể lấy thông tin user");
      }
    };

    fetchCurrentUser();
  }, []);

  return (
    <div>
      <h1>Internship Management</h1>

      {error && <p>{error}</p>}

      {userData && (
        <pre>
          {JSON.stringify(userData, null, 2)}
        </pre>
      )}

      <button onClick={() => keycloak.logout()}>
        Logout
      </button>
    </div>
  );
}

export default App;