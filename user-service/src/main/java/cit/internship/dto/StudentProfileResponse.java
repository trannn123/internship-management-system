package cit.internship.dto;

public class StudentProfileResponse {

    private Long id;
    private String studentCode;
    private String major;
    private String className;
    private String phone;

    public StudentProfileResponse() {
    }

    public StudentProfileResponse(
            Long id,
            String studentCode,
            String major,
            String className,
            String phone) {

        this.id = id;
        this.studentCode = studentCode;
        this.major = major;
        this.className = className;
        this.phone = phone;
    }

    public Long getId() {
        return id;
    }

    public String getStudentCode() {
        return studentCode;
    }

    public String getMajor() {
        return major;
    }

    public String getClassName() {
        return className;
    }

    public String getPhone() {
        return phone;
    }
}