package cit.internship.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "internship_registrations",
        uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "opportunity_id"})
)
public class InternshipRegistration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "period_id", nullable = false)
    private Long periodId;

    @Column(name = "opportunity_id", nullable = false)
    private Long opportunityId;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "lecturer_id")
    private Long lecturerId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RegistrationStatus status;

    @Column(name = "registered_at", nullable = false)
    private LocalDateTime registeredAt;

    @Column(name = "approved_by_company_at")
    private LocalDateTime approvedByCompanyAt;

    @Column(name = "approved_by_lecturer_at")
    private LocalDateTime approvedByLecturerAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    public InternshipRegistration() {
    }

    @PrePersist
    public void prePersist() {
        if (status == null) {
            status = RegistrationStatus.PENDING_COMPANY;
        }
        if (registeredAt == null) {
            registeredAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
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
