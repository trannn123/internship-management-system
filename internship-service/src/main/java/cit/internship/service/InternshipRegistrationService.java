package cit.internship.service;

import cit.internship.client.evaluation.EvaluationExistenceResponse;
import cit.internship.client.evaluation.EvaluationServiceClient;
import cit.internship.dto.InternshipRegistrationRequest;
import cit.internship.dto.InternshipRegistrationResponse;
import cit.internship.entity.*;
import cit.internship.repository.InternshipPeriodLecturerRepository;
import cit.internship.repository.InternshipRegistrationRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.ProcessingException;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.rest.client.inject.RestClient;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@ApplicationScoped
public class InternshipRegistrationService {

    @Inject
    InternshipRegistrationRepository internshipRegistrationRepository;

    @Inject
    InternshipOpportunityService internshipOpportunityService;

    @Inject
    InternshipPeriodService internshipPeriodService;

    @Inject
    InternshipPeriodLecturerRepository internshipPeriodLecturerRepository;

    @Inject
    InternshipService internshipService;

    @Inject
    CurrentUserService currentUserService;

    @Inject
    @RestClient
    EvaluationServiceClient evaluationServiceClient;

    public List<InternshipRegistrationResponse> getVisibleRegistrations() {
        String role = currentUserService.getRole();
        Long currentUserId = currentUserService.getUserId();

        List<InternshipRegistration> registrations;
        switch (role) {
            case "ADMIN":
                registrations = internshipRegistrationRepository.listAll();
                break;
            case "STUDENT":
                registrations = internshipRegistrationRepository.findByStudentId(currentUserId);
                break;
            case "COMPANY":
                registrations = internshipRegistrationRepository.findByCompanyId(currentUserId);
                break;
            case "LECTURER":
                registrations = internshipRegistrationRepository.findByLecturerId(currentUserId);
                break;
            default:
                throw new ForbiddenException("You do not have permission to view registrations");
        }

        return registrations.stream()
                .map(this::toResponse)
                .toList();
    }

    public InternshipRegistrationResponse getVisibleRegistrationById(Long id) {
        return toResponse(requireAccessibleRegistration(id));
    }

    @Transactional
    public InternshipRegistrationResponse createRegistration(InternshipRegistrationRequest request) {
        Long studentId = currentUserService.getUserId();
        InternshipOpportunity opportunity = internshipOpportunityService.getOpportunityEntityById(request.getOpportunityId());
        InternshipPeriod period = internshipPeriodService.getPeriodEntityById(opportunity.getPeriodId());

        if (opportunity.getStatus() != OpportunityStatus.OPEN) {
            throw new BadRequestException("Registration is only allowed for OPEN opportunities");
        }

        if (!internshipPeriodService.isRegistrationWindowOpen(period)) {
            throw new BadRequestException("Registration is only allowed while the internship period is OPEN and within its registration window");
        }

        if (internshipRegistrationRepository.findByStudentIdAndOpportunityId(studentId, opportunity.getId()) != null) {
            throw new BadRequestException("You have already registered for this opportunity");
        }

        InternshipRegistration registration = new InternshipRegistration();
        registration.setPeriodId(period.getId());
        registration.setOpportunityId(opportunity.getId());
        registration.setStudentId(studentId);
        registration.setCompanyId(opportunity.getCompanyId());
        registration.setLecturerId(selectLecturerId(period.getId()));
        registration.setStatus(RegistrationStatus.PENDING_COMPANY);
        registration.setRegisteredAt(LocalDateTime.now());
        internshipRegistrationRepository.persist(registration);

        return toResponse(registration);
    }

    @Transactional
    public InternshipRegistrationResponse approveByCompany(Long id) {
        InternshipRegistration registration = requireRegistration(id);
        Long companyId = currentUserService.getUserId();

        if (!registration.getCompanyId().equals(companyId)) {
            throw new ForbiddenException("You do not have permission to approve this registration");
        }

        if (registration.getStatus() != RegistrationStatus.PENDING_COMPANY) {
            throw new BadRequestException("Registration is not waiting for company approval");
        }

        assignLecturerIfPossible(registration);
        if (registration.getLecturerId() == null) {
            throw new BadRequestException("No lecturer is assigned to this internship period yet");
        }

        registration.setStatus(RegistrationStatus.PENDING_LECTURER);
        registration.setApprovedByCompanyAt(LocalDateTime.now());

        return toResponse(registration);
    }

    @Transactional
    public InternshipRegistrationResponse rejectByCompany(Long id) {
        InternshipRegistration registration = requireRegistration(id);
        Long companyId = currentUserService.getUserId();

        if (!registration.getCompanyId().equals(companyId)) {
            throw new ForbiddenException("You do not have permission to reject this registration");
        }

        if (registration.getStatus() != RegistrationStatus.PENDING_COMPANY) {
            throw new BadRequestException("Registration is not waiting for company approval");
        }

        registration.setStatus(RegistrationStatus.REJECTED_COMPANY);
        return toResponse(registration);
    }

    @Transactional
    public InternshipRegistrationResponse approveByLecturer(Long id) {
        InternshipRegistration registration = requireRegistration(id);
        Long lecturerId = currentUserService.getUserId();

        if (registration.getLecturerId() == null || !registration.getLecturerId().equals(lecturerId)) {
            throw new ForbiddenException("You do not have permission to approve this registration");
        }

        if (registration.getStatus() != RegistrationStatus.PENDING_LECTURER) {
            throw new BadRequestException("Registration is not waiting for lecturer approval");
        }

        InternshipOpportunity opportunity = internshipOpportunityService.getOpportunityEntityById(registration.getOpportunityId());
        InternshipPeriod period = internshipPeriodService.getPeriodEntityById(registration.getPeriodId());

        registration.setStatus(RegistrationStatus.IN_PROGRESS);
        registration.setApprovedByLecturerAt(LocalDateTime.now());
        internshipService.createOrReuseFromRegistration(registration, opportunity, period);

        return toResponse(registration);
    }

    @Transactional
    public InternshipRegistrationResponse rejectByLecturer(Long id) {
        InternshipRegistration registration = requireRegistration(id);
        Long lecturerId = currentUserService.getUserId();

        if (registration.getLecturerId() == null || !registration.getLecturerId().equals(lecturerId)) {
            throw new ForbiddenException("You do not have permission to reject this registration");
        }

        if (registration.getStatus() != RegistrationStatus.PENDING_LECTURER) {
            throw new BadRequestException("Registration is not waiting for lecturer approval");
        }

        registration.setStatus(RegistrationStatus.REJECTED_LECTURER);
        return toResponse(registration);
    }

    @Transactional
    public InternshipRegistrationResponse completeByCompanyEvaluation(Long internshipId, Long companyId) {
        Internship internship = internshipService.getInternshipById(internshipId);
        if (internship == null) {
            throw new NotFoundException("Internship not found");
        }

        if (internship.getCompanyId() == null || !internship.getCompanyId().equals(companyId)) {
            throw new ForbiddenException("You do not have permission to complete this internship");
        }

        InternshipRegistration registration = internshipRegistrationRepository.findById(internship.getRegistrationId());
        if (registration == null) {
            throw new BadRequestException("No registration record exists for this internship");
        }

        if (registration.getStatus() == RegistrationStatus.IN_PROGRESS) {
            registration.setStatus(RegistrationStatus.COMPLETED_COMPANY);
            internship.setStatus(InternshipStatus.COMPLETED_COMPANY);
        }

        return toResponse(registration);
    }

    @Transactional
    public InternshipRegistrationResponse completeRegistration(Long id) {
        InternshipRegistration registration = requireRegistration(id);
        enforceCompletionAccess(registration);

        if (registration.getStatus() != RegistrationStatus.IN_PROGRESS
                && registration.getStatus() != RegistrationStatus.COMPLETED_COMPANY) {
            throw new BadRequestException("Registration is not in progress");
        }

        Internship internship = internshipService.getInternshipByRegistrationId(registration.getId());
        if (internship == null) {
            throw new BadRequestException("No internship record exists for this registration");
        }

        ensureEvaluationsExist(internship.getId());

        registration.setStatus(RegistrationStatus.COMPLETED);
        registration.setCompletedAt(LocalDateTime.now());
        internship.setStatus(InternshipStatus.COMPLETED_LECTURER);

        return toResponse(registration);
    }

    private InternshipRegistration requireAccessibleRegistration(Long id) {
        InternshipRegistration registration = requireRegistration(id);
        String role = currentUserService.getRole();
        Long currentUserId = currentUserService.getUserId();

        boolean allowed = switch (role) {
            case "ADMIN" -> true;
            case "STUDENT" -> registration.getStudentId().equals(currentUserId);
            case "COMPANY" -> registration.getCompanyId().equals(currentUserId);
            case "LECTURER" -> registration.getLecturerId() != null && registration.getLecturerId().equals(currentUserId);
            default -> false;
        };

        if (!allowed) {
            throw new ForbiddenException("You do not have permission to view this registration");
        }

        return registration;
    }

    private InternshipRegistration requireRegistration(Long id) {
        InternshipRegistration registration = internshipRegistrationRepository.findById(id);

        if (registration == null) {
            throw new NotFoundException("Internship registration not found");
        }

        return registration;
    }

    private Long selectLecturerId(Long periodId) {
        return internshipPeriodLecturerRepository.findByPeriodId(periodId)
                .stream()
                .min(Comparator
                        .comparingLong((InternshipPeriodLecturer assignment) -> internshipRegistrationRepository.countByPeriodIdAndLecturerId(periodId, assignment.getLecturerId()))
                        .thenComparing(InternshipPeriodLecturer::getLecturerId))
                .map(InternshipPeriodLecturer::getLecturerId)
                .orElse(null);
    }

    private void assignLecturerIfPossible(InternshipRegistration registration) {
        if (registration.getLecturerId() != null) {
            return;
        }

        // If no lecturer has been assigned to the period yet, keep the registration pending company first and retry assignment on company approval.
        registration.setLecturerId(selectLecturerId(registration.getPeriodId()));
    }

    private void enforceCompletionAccess(InternshipRegistration registration) {
        String role = currentUserService.getRole();
        Long currentUserId = currentUserService.getUserId();

        switch (role) {
            case "ADMIN":
                return;
            case "COMPANY":
                if (!registration.getCompanyId().equals(currentUserId)) {
                    throw new ForbiddenException("You do not have permission to complete this registration");
                }
                return;
            case "LECTURER":
                if (registration.getLecturerId() == null || !registration.getLecturerId().equals(currentUserId)) {
                    throw new ForbiddenException("You do not have permission to complete this registration");
                }
                return;
            default:
                throw new ForbiddenException("You do not have permission to complete this registration");
        }
    }

    private void ensureEvaluationsExist(Long internshipId) {
        EvaluationExistenceResponse evaluationExistence;
        try {
            evaluationExistence = evaluationServiceClient.getEvaluationExistence(internshipId);
        } catch (ProcessingException ex) {
            throw new WebApplicationException("Unable to reach evaluation-service", Response.Status.BAD_GATEWAY);
        } catch (WebApplicationException ex) {
            throw new WebApplicationException("Unable to verify internship evaluations", Response.Status.BAD_GATEWAY);
        }

        if (evaluationExistence == null
                || !evaluationExistence.isCompanyEvaluationExists()
                || !evaluationExistence.isLecturerEvaluationExists()) {
            throw new BadRequestException("Both company and lecturer evaluations must exist before completing the registration");
        }
    }

    private InternshipRegistrationResponse toResponse(InternshipRegistration registration) {
        InternshipRegistrationResponse response = new InternshipRegistrationResponse();
        response.setId(registration.getId());
        response.setPeriodId(registration.getPeriodId());
        response.setOpportunityId(registration.getOpportunityId());
        response.setStudentId(registration.getStudentId());
        response.setCompanyId(registration.getCompanyId());
        response.setLecturerId(registration.getLecturerId());
        response.setStatus(registration.getStatus());
        response.setRegisteredAt(registration.getRegisteredAt());
        response.setApprovedByCompanyAt(registration.getApprovedByCompanyAt());
        response.setApprovedByLecturerAt(registration.getApprovedByLecturerAt());
        response.setCompletedAt(registration.getCompletedAt());
        return response;
    }
}
