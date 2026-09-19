package cit.evaluation.service;

import cit.evaluation.client.internship.InternshipResponse;
import cit.evaluation.client.internship.InternshipServiceClient;
import cit.evaluation.dto.EvaluationSummaryResponse;
import cit.evaluation.entity.CompanyEvaluation;
import cit.evaluation.entity.LecturerEvaluation;
import cit.evaluation.repository.CompanyEvaluationRepository;
import cit.evaluation.repository.LecturerEvaluationRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.rest.client.inject.RestClient;

@ApplicationScoped
public class EvaluationSummaryService {

    @Inject
    CompanyEvaluationRepository companyEvaluationRepository;

    @Inject
    LecturerEvaluationRepository lecturerEvaluationRepository;

    @Inject
    @RestClient
    InternshipServiceClient internshipServiceClient;

    public boolean canViewSummary(
            Long internshipId,
            Long userId,
            String role) {

        InternshipResponse internship =
                internshipServiceClient.getInternshipById(internshipId);

        if (internship == null) {
            return false;
        }

        if ("STUDENT".equals(role)) {
            return internship.getStudentId() != null
                    && internship.getStudentId().equals(userId);
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

    public EvaluationSummaryResponse getSummary(Long internshipId) {

        CompanyEvaluation companyEvaluation =
                companyEvaluationRepository.findByInternshipId(
                        internshipId
                );

        LecturerEvaluation lecturerEvaluation =
                lecturerEvaluationRepository.findByInternshipId(
                        internshipId
                );

        EvaluationSummaryResponse response =
                new EvaluationSummaryResponse();

        response.setInternshipId(internshipId);

        if (companyEvaluation != null) {
            response.setCompanyScore(
                    companyEvaluation.getScore()
            );

            response.setCompanyComment(
                    companyEvaluation.getComment()
            );
        }

        if (lecturerEvaluation != null) {
            response.setLecturerScore(
                    lecturerEvaluation.getScore()
            );

            response.setLecturerComment(
                    lecturerEvaluation.getComment()
            );
        }

        if (companyEvaluation != null
                && lecturerEvaluation != null) {

            double finalScore =
                    (companyEvaluation.getScore() * 0.8
                            + lecturerEvaluation.getScore() * 0.2);

            response.setFinalScore(finalScore);
        }

        return response;
    }
}