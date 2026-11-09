package cit.internship.dto;

public class LecturerSummaryResponse {

    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String lecturerCode;
    private String department;

    public LecturerSummaryResponse() {
    }

    public LecturerSummaryResponse(Long id, Long userId, String fullName, String email, String lecturerCode, String department) {
        this.id = id;
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.lecturerCode = lecturerCode;
        this.department = department;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getLecturerCode() {
        return lecturerCode;
    }

    public void setLecturerCode(String lecturerCode) {
        this.lecturerCode = lecturerCode;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }
}
