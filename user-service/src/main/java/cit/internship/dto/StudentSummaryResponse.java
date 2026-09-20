package cit.internship.dto;

/**
 * Lightweight student directory entry. Exposes the Student profile id (not the
 * User id) since that is the id other services store as `studentId`.
 */
public class StudentSummaryResponse {

    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private String studentCode;
    private String className;
    private String major;

    public StudentSummaryResponse() {
    }

    public StudentSummaryResponse(
            Long id,
            Long userId,
            String fullName,
            String email,
            String studentCode,
            String className,
            String major) {
        this.id = id;
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.studentCode = studentCode;
        this.className = className;
        this.major = major;
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

    public String getStudentCode() {
        return studentCode;
    }

    public void setStudentCode(String studentCode) {
        this.studentCode = studentCode;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getMajor() {
        return major;
    }

    public void setMajor(String major) {
        this.major = major;
    }
}
