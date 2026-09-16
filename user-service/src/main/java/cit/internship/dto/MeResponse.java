package cit.internship.dto;

public class MeResponse {

    private Long id;
    private String keycloakUserId;
    private String fullName;
    private String email;
    private String role;
    private Object profile;

    public MeResponse() {
    }

    public MeResponse(
            Long id,
            String keycloakUserId,
            String fullName,
            String email,
            String role,
            Object profile) {

        this.id = id;
        this.keycloakUserId = keycloakUserId;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.profile = profile;
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

    public String getRole() {
        return role;
    }

    public Object getProfile() {
        return profile;
    }
}