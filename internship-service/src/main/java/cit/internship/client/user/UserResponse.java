package cit.internship.client.user;

public class UserResponse {

    private Long id;
    private String keycloakUserId;
    private String fullName;
    private String email;

    public UserResponse() {
    }

    public Long getId() {
        return id;
    }

    public String getKeycloakUserId() {
        return keycloakUserId;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }
}