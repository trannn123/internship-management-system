package cit.evaluation.service;

import cit.evaluation.client.internship.InternshipResponse;
import cit.evaluation.client.internship.InternshipServiceClient;
import cit.evaluation.dto.EvaluationExistenceResponse;
import cit.evaluation.dto.EvaluationSummaryResponse;
import cit.evaluation.entity.CompanyEvaluation;
import cit.evaluation.entity.LecturerEvaluation;
import cit.evaluation.repository.CompanyEvaluationRepository;
import cit.evaluation.repository.LecturerEvaluationRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import jakarta.ws.rs.ForbiddenException;
import jakarta.ws.rs.WebApplicationException;

@ApplicationScoped
public class EvaluationSummaryService {

    @Inject
    CompanyEvaluationRepository companyEvaluationRepository;

    @Inject
    LecturerEvaluationRepository lecturerEvaluationRepository;

    @Inject
    @RestClient
    InternshipServiceClient internshipServiceClient;

    public boolean canViewSummary(Long internshipId, Long userId, String role) {
        InternshipResponse internship;

        try {
            internship = internshipServiceClient.getInternshipById(internshipId);
        } catch (WebApplicationException e) {
            if (e.getResponse() != null && e.getResponse().getStatus() == 403) {
                throw new ForbiddenException("You do not have permission to view this internship");
            }

            throw e;
        }

        if (internship == null) {
            return false;
        }

        if ("ADMIN".equals(role)) {
            return true;
        }

        if ("STUDENT".equals(role)) {
            return internship.getStudentId() != null && internship.getStudentId().equals(userId);
        }

        if ("COMPANY".equals(role)) {
            return internship.getCompanyId() != null && internship.getCompanyId().equals(userId);
        }

        if ("LECTURER".equals(role)) {
            return internship.getLecturerId() != null && internship.getLecturerId().equals(userId);
        }

        return false;
    }

    public EvaluationSummaryResponse getSummary(Long internshipId, String role) {
        CompanyEvaluation companyEvaluation = companyEvaluationRepository.findByInternshipId(internshipId);

        LecturerEvaluation lecturerEvaluation = lecturerEvaluationRepository.findByInternshipId(internshipId);

        boolean hasCompanyEvaluation = companyEvaluation != null;
        boolean hasLecturerEvaluation = lecturerEvaluation != null;
        boolean hasFinalScore = hasCompanyEvaluation && hasLecturerEvaluation;

        if ("STUDENT".equals(role) && !hasFinalScore) {
            throw new jakarta.ws.rs.ForbiddenException("Final score is not available yet");
        }

        if ("STUDENT".equals(role)) {
            EvaluationSummaryResponse studentResponse = new EvaluationSummaryResponse();

            studentResponse.setInternshipId(internshipId);

            double finalScore = Math.round((companyEvaluation.getScore() * 0.8 + lecturerEvaluation.getScore() * 0.2) * 100.0) / 100.0;

            studentResponse.setFinalScore(finalScore);

            return studentResponse;
        }

        EvaluationSummaryResponse response = new EvaluationSummaryResponse();
        response.setInternshipId(internshipId);

        boolean canSeeCompanyEvaluation = !"LECTURER".equals(role) || hasLecturerEvaluation;

        if (hasCompanyEvaluation && canSeeCompanyEvaluation) {
            response.setCompanyScore(companyEvaluation.getScore());
            response.setCompanyComment(companyEvaluation.getComment());
        }

        if (hasLecturerEvaluation) {
            response.setLecturerScore(lecturerEvaluation.getScore());
            response.setLecturerComment(lecturerEvaluation.getComment());
        }

        if (hasFinalScore) {
            double finalScore = Math.round((companyEvaluation.getScore() * 0.8 + lecturerEvaluation.getScore() * 0.2) * 100.0) / 100.0;

            response.setFinalScore(finalScore);
        }

        return response;
    }

    public EvaluationExistenceResponse getEvaluationExistence(Long internshipId) {
        CompanyEvaluation companyEvaluation = companyEvaluationRepository.findByInternshipId(internshipId);

        LecturerEvaluation lecturerEvaluation = lecturerEvaluationRepository.findByInternshipId(internshipId);

        EvaluationExistenceResponse response = new EvaluationExistenceResponse();

        response.setInternshipId(internshipId);
        response.setCompanyEvaluationExists(companyEvaluation != null);
        response.setLecturerEvaluationExists(lecturerEvaluation != null);

        return response;
    }
}