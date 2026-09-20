import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8080",
  realm: "internship-management",
  clientId: "internship-management-app",
});

export default keycloak;