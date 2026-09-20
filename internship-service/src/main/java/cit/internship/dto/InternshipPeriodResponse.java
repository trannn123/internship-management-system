package cit.internship.dto;

import cit.internship.entity.InternshipPeriodStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class InternshipPeriodResponse {

    private Long id;
    private String name;
    private String description;
    private LocalDate registrationStartDate;
    private LocalDate registrationEndDate;
    private LocalDate internshipStartDate;
    private LocalDate internshipEndDate;
    private InternshipPeriodStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public InternshipPeriodResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getRegistrationStartDate() {
        return registrationStartDate;
    }

    public void setRegistrationStartDate(LocalDate registrationStartDate) {
        this.registrationStartDate = registrationStartDate;
    }

    public LocalDate getRegistrationEndDate() {
        return registrationEndDate;
    }

    public void setRegistrationEndDate(LocalDate registrationEndDate) {
        this.registrationEndDate = registrationEndDate;
    }

    public LocalDate getInternshipStartDate() {
        return internshipStartDate;
    }

    public void setInternshipStartDate(LocalDate internshipStartDate) {
        this.internshipStartDate = internshipStartDate;
    }

    public LocalDate getInternshipEndDate() {
        return internshipEndDate;
    }

    public void setInternshipEndDate(LocalDate internshipEndDate) {
        this.internshipEndDate = internshipEndDate;
    }

    public InternshipPeriodStatus getStatus() {
        return status;
    }

    public void setStatus(InternshipPeriodStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
