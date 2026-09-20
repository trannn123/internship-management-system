package cit.internship.dto;

import jakarta.validation.constraints.NotNull;

public class InternshipRegistrationRequest {

    @NotNull
    private Long opportunityId;

    public InternshipRegistrationRequest() {
    }

    public Long getOpportunityId() {
        return opportunityId;
    }

    public void setOpportunityId(Long opportunityId) {
        this.opportunityId = opportunityId;
    }
}
