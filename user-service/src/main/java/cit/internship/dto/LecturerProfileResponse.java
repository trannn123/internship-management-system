package cit.internship.dto;

public class LecturerProfileResponse {

    private Long id;
    private String lecturerCode;
    private String department;
    private String phone;

    public LecturerProfileResponse() {
    }

    public LecturerProfileResponse(
            Long id,
            String lecturerCode,
            String department,
            String phone) {

        this.id = id;
        this.lecturerCode = lecturerCode;
        this.department = department;
        this.phone = phone;
    }

    public Long getId() {
        return id;
    }

    public String getLecturerCode() {
        return lecturerCode;
    }

    public String getDepartment() {
        return department;
    }

    public String getPhone() {
        return phone;
    }
}