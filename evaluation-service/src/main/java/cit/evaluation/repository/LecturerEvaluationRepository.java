package cit.evaluation.repository;

import cit.evaluation.entity.LecturerEvaluation;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class LecturerEvaluationRepository
        implements PanacheRepository<LecturerEvaluation> {

    public LecturerEvaluation findByInternshipId(Long internshipId) {
        return find("internshipId", internshipId).firstResult();
    }

    public LecturerEvaluation findByLecturerIdAndInternshipId(
            Long lecturerId,
            Long internshipId) {

        return find(
                "lecturerId = ?1 and internshipId = ?2",
                lecturerId,
                internshipId
        ).firstResult();
    }
}