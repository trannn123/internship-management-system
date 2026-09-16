package cit.internship.dto;

import jakarta.validation.constraints.NotBlank;

public class LecturerProfileRequest {

    @NotBlank
    private String lecturerCode;

    @NotBlank
    private String department;

    @NotBlank
    private String phone;

    public LecturerProfileRequest() {
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

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}