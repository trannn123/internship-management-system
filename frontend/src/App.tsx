import { useEffect, useState } from "react";
import keycloak from "./keycloak";
import { getCurrentUser } from "./api/user-api";
import { getMyInternships } from "./api/internship-api";
import { getEvaluationSummary } from "./api/evaluation-api";

function App() {
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const data = await getMyInternships();
      console.log("My internships:", data);
    } catch (err) {
      console.error("Failed to fetch internships:", err);
    }
  };

  fetchData();

  const fetchEvaluation = async () => {
  try {
    const data = await getEvaluationSummary(1);
    console.log("Evaluation summary:", data);
  } catch (err) {
    console.error("Failed to fetch evaluation:", err);
  }
};

fetchEvaluation();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const data = await getCurrentUser();
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