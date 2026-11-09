package cit.evaluation.service;

import cit.evaluation.client.internship.InternshipResponse;
import cit.evaluation.dto.CompanyEvaluationRequest;
import cit.evaluation.entity.CompanyEvaluation;
import cit.evaluation.repository.CompanyEvaluationRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import cit.evaluation.client.internship.InternshipServiceClient;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import cit.evaluation.repository.LecturerEvaluationRepository;
import java.time.LocalDateTime;
import cit.evaluation.client.internship.InternshipPeriodEndDateResponse;
import java.time.LocalDate;

@ApplicationScoped
public class CompanyEvaluationService {

    @Inject
    CompanyEvaluationRepository companyEvaluationRepository;

    @Inject
    LecturerEvaluationRepository lecturerEvaluationRepository;

    @Inject
    @RestClient
    InternshipServiceClient internshipServiceClient;

    public CompanyEvaluation getEvaluationByInternshipId(Long internshipId) {
        return companyEvaluationRepository.findByInternshipId(internshipId);
    }

    @Transactional
    public CompanyEvaluation createEvaluation(Long internshipId, Long companyId, CompanyEvaluationRequest request) {
        InternshipResponse internship = internshipServiceClient.getInternshipById(internshipId);

        if (internship == null) {
            throw new IllegalArgumentException("Internship not found");
        }

        if (internship.getCompanyId() == null || !internship.getCompanyId().equals(companyId)) {
            throw new IllegalArgumentException("You do not have permission to evaluate this internship");
        }

        if (!"IN_PROGRESS".equals(internship.getStatus())) {
            throw new jakarta.ws.rs.BadRequestException("Company evaluation is only allowed when internship is IN_PROGRESS");
        }

        InternshipPeriodEndDateResponse periodResponse = internshipServiceClient.getInternshipPeriodEndDate(internshipId);

        if (periodResponse == null || periodResponse.getInternshipEndDate() == null) {
            throw new jakarta.ws.rs.BadRequestException("Internship period end date is not available");
        }

        LocalDate internshipEndDate = periodResponse.getInternshipEndDate();

        if (!LocalDate.now().isAfter(internshipEndDate)) {
            throw new jakarta.ws.rs.BadRequestException("Company evaluation is only allowed after the internship period ends");
        }

        CompanyEvaluation existingEvaluation = companyEvaluationRepository.findByInternshipId(internshipId);

        if (existingEvaluation != null) {
            throw new IllegalArgumentException("Company evaluation already exists for this internship");
        }

        CompanyEvaluation evaluation = new CompanyEvaluation();
        evaluation.setInternshipId(internshipId);
        evaluation.setCompanyId(companyId);
        evaluation.setScore(request.getScore());
        evaluation.setComment(request.getComment());
        evaluation.setEvaluatedAt(LocalDateTime.now());

        companyEvaluationRepository.persist(evaluation);

        return evaluation;
    }

    public boolean canViewEvaluation(Long internshipId, Long userId, String role) {
        InternshipResponse internship = internshipServiceClient.getInternshipById(internshipId);

        if (internship == null) {
            return false;
        }

        if ("COMPANY".equals(role)) {
            return internship.getCompanyId() != null && internship.getCompanyId().equals(userId);
        }

        if ("LECTURER".equals(role)) {
            if (internship.getLecturerId() == null || !internship.getLecturerId().equals(userId)) {
                return false;
            }

            return lecturerEvaluationRepository.findByLecturerIdAndInternshipId(userId, internshipId) != null;
        }

        return false;
    }
}