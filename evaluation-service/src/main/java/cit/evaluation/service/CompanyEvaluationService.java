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

import java.time.LocalDateTime;

@ApplicationScoped
public class CompanyEvaluationService {

    @Inject
    CompanyEvaluationRepository companyEvaluationRepository;

    @Inject
    @RestClient
    InternshipServiceClient internshipServiceClient;

    public CompanyEvaluation getEvaluationByInternshipId(Long internshipId) {
        return companyEvaluationRepository.findByInternshipId(internshipId);
    }

    @Transactional
    public CompanyEvaluation createEvaluation(
            Long internshipId,
            Long companyId,
            CompanyEvaluationRequest request) {

        InternshipResponse internship =
                internshipServiceClient.getInternshipById(internshipId);

        if (internship == null) {
            throw new IllegalArgumentException("Internship not found");
        }

        if (internship.getCompanyId() == null
                || !internship.getCompanyId().equals(companyId)) {
            throw new IllegalArgumentException(
                    "You do not have permission to evaluate this internship");
        }

        CompanyEvaluation existingEvaluation =
                companyEvaluationRepository.findByInternshipId(internshipId);

        if (existingEvaluation != null) {
            throw new IllegalArgumentException(
                    "Company evaluation already exists for this internship");
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

    public boolean canViewEvaluation(
            Long internshipId,
            Long userId,
            String role) {

        InternshipResponse internship =
                internshipServiceClient.getInternshipById(internshipId);

        if (internship == null) {
            return false;
        }

        if ("COMPANY".equals(role)) {
            return internship.getCompanyId() != null
                    && internship.getCompanyId().equals(userId);
        }

        if ("LECTURER".equals(role)) {
            return internship.getLecturerId() != null
                    && internship.getLecturerId().equals(userId);
        }

        return false;
    }
}