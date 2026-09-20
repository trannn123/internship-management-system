package cit.evaluation.service;

import cit.evaluation.client.internship.InternshipResponse;
import cit.evaluation.client.internship.InternshipServiceClient;
import cit.evaluation.dto.LecturerEvaluationRequest;
import cit.evaluation.entity.LecturerEvaluation;
import cit.evaluation.repository.LecturerEvaluationRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.eclipse.microprofile.rest.client.inject.RestClient;

import java.time.LocalDateTime;

@ApplicationScoped
public class LecturerEvaluationService {

    @Inject
    LecturerEvaluationRepository lecturerEvaluationRepository;

    @Inject
    @RestClient
    InternshipServiceClient internshipServiceClient;

    public LecturerEvaluation getEvaluationByInternshipId(
            Long internshipId) {

        return lecturerEvaluationRepository
                .findByInternshipId(internshipId);
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

        if ("LECTURER".equals(role)) {
            return internship.getLecturerId() != null
                    && internship.getLecturerId().equals(userId);
        }

        if ("COMPANY".equals(role)) {
            return internship.getCompanyId() != null
                    && internship.getCompanyId().equals(userId);
        }

        return false;
    }

    @Transactional
    public LecturerEvaluation createEvaluation(
            Long internshipId,
            Long lecturerId,
            LecturerEvaluationRequest request) {

        InternshipResponse internship =
                internshipServiceClient.getInternshipById(internshipId);

        if (internship == null) {
            throw new IllegalArgumentException(
                    "Internship not found");
        }

        if (internship.getLecturerId() == null
                || !internship.getLecturerId().equals(lecturerId)) {

            throw new IllegalArgumentException(
                    "You do not have permission to evaluate this internship");
        }

        LecturerEvaluation existingEvaluation =
                lecturerEvaluationRepository
                        .findByInternshipId(internshipId);

        if (existingEvaluation != null) {
            throw new IllegalArgumentException(
                    "Lecturer evaluation already exists for this internship");
        }

        LecturerEvaluation evaluation =
                new LecturerEvaluation();

        evaluation.setInternshipId(internshipId);
        evaluation.setLecturerId(lecturerId);
        evaluation.setScore(request.getScore());
        evaluation.setComment(request.getComment());
        evaluation.setEvaluatedAt(LocalDateTime.now());

        lecturerEvaluationRepository.persist(evaluation);

        return evaluation;
    }
}