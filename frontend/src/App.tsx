import keycloak from "./keycloak";

function App() {
  return (
    <div>
      <h1>Internship Management</h1>

      <p>
        <strong>Username:</strong>{" "}
        {keycloak.tokenParsed?.preferred_username}
      </p>

      <p>
        <strong>Email:</strong>{" "}
        {keycloak.tokenParsed?.email}
      </p>

      <p>
        <strong>Name:</strong>{" "}
        {keycloak.tokenParsed?.name}
      </p>

      <p>
        <strong>Roles:</strong>{" "}
        {keycloak.tokenParsed?.realm_access?.roles?.join(", ")}
      </p>

      <button onClick={() => keycloak.logout()}>
        Logout
      </button>
    </div>
  );
}

export default App;