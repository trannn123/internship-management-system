package cit.evaluation.repository;

import cit.evaluation.entity.CompanyEvaluation;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class CompanyEvaluationRepository
        implements PanacheRepository<CompanyEvaluation> {

    public CompanyEvaluation findByInternshipId(Long internshipId) {
        return find("internshipId", internshipId).firstResult();
    }

    public CompanyEvaluation findByCompanyIdAndInternshipId(
            Long companyId,
            Long internshipId
    ) {
        return find(
                "companyId = ?1 and internshipId = ?2",
                companyId,
                internshipId
        ).firstResult();
    }
}