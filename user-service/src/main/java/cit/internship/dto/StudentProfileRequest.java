package cit.internship.dto;

import jakarta.validation.constraints.NotBlank;

public class StudentProfileRequest {

    @NotBlank
    private String studentCode;

    @NotBlank
    private String major;

    @NotBlank
    private String className;

    @NotBlank
    private String phone;

    public StudentProfileRequest() {
    }

    public String getStudentCode() {
        return studentCode;
    }

    public void setStudentCode(String studentCode) {
        this.studentCode = studentCode;
    }

    public String getMajor() {
        return major;
    }

    public void setMajor(String major) {
        this.major = major;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}