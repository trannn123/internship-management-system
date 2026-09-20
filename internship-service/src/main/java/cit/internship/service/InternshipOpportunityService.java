package cit.internship.service;

import cit.internship.dto.InternshipOpportunityRequest;
import cit.internship.dto.InternshipOpportunityResponse;
import cit.internship.entity.InternshipOpportunity;
import cit.internship.entity.InternshipPeriod;
import cit.internship.entity.InternshipPeriodStatus;
import cit.internship.entity.OpportunityStatus;
import cit.internship.repository.InternshipOpportunityRepository;
import cit.internship.repository.InternshipPeriodRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@ApplicationScoped
public class InternshipOpportunityService {

    @Inject
    InternshipOpportunityRepository internshipOpportunityRepository;

    @Inject
    InternshipPeriodService internshipPeriodService;

    @Inject
    InternshipPeriodRepository internshipPeriodRepository;

    @Inject
    CurrentUserService currentUserService;

    public List<InternshipOpportunityResponse> getVisibleOpportunities() {
        String role = currentUserService.getRole();

        List<InternshipOpportunity> opportunities;
        if ("ADMIN".equals(role)) {
            opportunities = internshipOpportunityRepository.listAll();
        } else if ("COMPANY".equals(role)) {
            opportunities = internshipOpportunityRepository.findByCompanyId(currentUserService.getUserId());
        } else {
            Set<Long> openPeriodIds = internshipPeriodRepository.find("status", InternshipPeriodStatus.OPEN)
                    .list()
                    .stream()
                    .map(InternshipPeriod::getId)
                    .collect(Collectors.toSet());

            opportunities = internshipOpportunityRepository.listAll()
                    .stream()
                    .filter(opportunity -> opportunity.getStatus() == OpportunityStatus.OPEN)
                    .filter(opportunity -> openPeriodIds.contains(opportunity.getPeriodId()))
                    .toList();
        }

        return opportunities.stream()
                .map(this::toResponse)
                .toList();
    }

    public InternshipOpportunityResponse getOpportunityById(Long id) {
        InternshipOpportunity opportunity = requireOpportunity(id);
        String role = currentUserService.getRole();

        if ("COMPANY".equals(role) && !opportunity.getCompanyId().equals(currentUserService.getUserId())) {
            throw new ForbiddenException("You do not have permission to view this opportunity");
        }

        if (!("ADMIN".equals(role) || "COMPANY".equals(role))) {
            InternshipPeriod period = internshipPeriodService.getPeriodEntityById(opportunity.getPeriodId());
            if (opportunity.getStatus() != OpportunityStatus.OPEN || period.getStatus() != InternshipPeriodStatus.OPEN) {
                throw new NotFoundException("Opportunity not found");
            }
        }

        return toResponse(opportunity);
    }

    @Transactional
    public InternshipOpportunityResponse createOpportunity(InternshipOpportunityRequest request) {
        Long companyId = currentUserService.getUserId();
        internshipPeriodService.requireOpenPeriodForOpportunity(request.getPeriodId());

        InternshipOpportunity opportunity = new InternshipOpportunity();
        opportunity.setCompanyId(companyId);
        apply(opportunity, request);
        internshipOpportunityRepository.persist(opportunity);

        return toResponse(opportunity);
    }

    @Transactional
    public InternshipOpportunityResponse updateOpportunity(Long id, InternshipOpportunityRequest request) {
        InternshipOpportunity opportunity = requireOpportunity(id);
        Long companyId = currentUserService.getUserId();

        if (!opportunity.getCompanyId().equals(companyId)) {
            throw new ForbiddenException("You do not have permission to update this opportunity");
        }

        internshipPeriodService.requireOpenPeriodForOpportunity(request.getPeriodId());
        apply(opportunity, request);
        opportunity.setCompanyId(companyId);

        return toResponse(opportunity);
    }

    public InternshipOpportunity getOpportunityEntityById(Long id) {
        return requireOpportunity(id);
    }

    private InternshipOpportunity requireOpportunity(Long id) {
        InternshipOpportunity opportunity = internshipOpportunityRepository.findById(id);

        if (opportunity == null) {
            throw new NotFoundException("Internship opportunity not found");
        }

        return opportunity;
    }

    private void apply(InternshipOpportunity opportunity, InternshipOpportunityRequest request) {
        opportunity.setPeriodId(request.getPeriodId());
        opportunity.setPosition(request.getPosition());
        opportunity.setDescription(request.getDescription());
        opportunity.setRequirements(request.getRequirements());
        opportunity.setLocation(request.getLocation());
        opportunity.setQuantity(request.getQuantity());
        opportunity.setStatus(request.getStatus() != null ? request.getStatus() : OpportunityStatus.OPEN);
    }

    private InternshipOpportunityResponse toResponse(InternshipOpportunity opportunity) {
        InternshipOpportunityResponse response = new InternshipOpportunityResponse();
        response.setId(opportunity.getId());
        response.setPeriodId(opportunity.getPeriodId());
        response.setCompanyId(opportunity.getCompanyId());
        response.setPosition(opportunity.getPosition());
        response.setDescription(opportunity.getDescription());
        response.setRequirements(opportunity.getRequirements());
        response.setLocation(opportunity.getLocation());
        response.setQuantity(opportunity.getQuantity());
        response.setStatus(opportunity.getStatus());
        response.setCreatedAt(opportunity.getCreatedAt());
        response.setUpdatedAt(opportunity.getUpdatedAt());
        return response;
    }
}
