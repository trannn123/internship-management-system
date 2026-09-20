package cit.internship.dto;

import cit.internship.entity.InternshipPeriodStatus;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public class InternshipPeriodRequest {

    @NotBlank
    private String name;

    private String description;

    private LocalDate registrationStartDate;

    private LocalDate registrationEndDate;

    private LocalDate internshipStartDate;

    private LocalDate internshipEndDate;

    private InternshipPeriodStatus status;

    public InternshipPeriodRequest() {
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
}
