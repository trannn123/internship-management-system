package cit.internship.repository;

import cit.internship.entity.InternshipOpportunity;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class InternshipOpportunityRepository implements PanacheRepository<InternshipOpportunity> {

    public List<InternshipOpportunity> findByCompanyId(Long companyId) {
        return find("companyId", companyId).list();
    }

    public List<InternshipOpportunity> findByPeriodId(Long periodId) {
        return find("periodId", periodId).list();
    }
}
