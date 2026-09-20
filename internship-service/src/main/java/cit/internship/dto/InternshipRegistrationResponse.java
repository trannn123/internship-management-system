package cit.internship.dto;

import cit.internship.entity.RegistrationStatus;

import java.time.LocalDateTime;

public class InternshipRegistrationResponse {

    private Long id;
    private Long periodId;
    private Long opportunityId;
    private Long studentId;
    private Long companyId;
    private Long lecturerId;
    private RegistrationStatus status;
    private LocalDateTime registeredAt;
    private LocalDateTime approvedByCompanyAt;
    private LocalDateTime approvedByLecturerAt;
    private LocalDateTime completedAt;

    public InternshipRegistrationResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPeriodId() {
        return periodId;
    }

    public void setPeriodId(Long periodId) {
        this.periodId = periodId;
    }

    public Long getOpportunityId() {
        return opportunityId;
    }

    public void setOpportunityId(Long opportunityId) {
        this.opportunityId = opportunityId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Long getCompanyId() {
        return companyId;
    }

    public void setCompanyId(Long companyId) {
        this.companyId = companyId;
    }

    public Long getLecturerId() {
        return lecturerId;
    }

    public void setLecturerId(Long lecturerId) {
        this.lecturerId = lecturerId;
    }

    public RegistrationStatus getStatus() {
        return status;
    }

    public void setStatus(RegistrationStatus status) {
        this.status = status;
    }

    public LocalDateTime getRegisteredAt() {
        return registeredAt;
    }

    public void setRegisteredAt(LocalDateTime registeredAt) {
        this.registeredAt = registeredAt;
    }

    public LocalDateTime getApprovedByCompanyAt() {
        return approvedByCompanyAt;
    }

    public void setApprovedByCompanyAt(LocalDateTime approvedByCompanyAt) {
        this.approvedByCompanyAt = approvedByCompanyAt;
    }

    public LocalDateTime getApprovedByLecturerAt() {
        return approvedByLecturerAt;
    }

    public void setApprovedByLecturerAt(LocalDateTime approvedByLecturerAt) {
        this.approvedByLecturerAt = approvedByLecturerAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
