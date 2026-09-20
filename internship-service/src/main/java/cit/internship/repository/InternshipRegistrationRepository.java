package cit.internship.repository;

import cit.internship.entity.InternshipRegistration;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class InternshipRegistrationRepository implements PanacheRepository<InternshipRegistration> {

    public InternshipRegistration findByStudentIdAndOpportunityId(Long studentId, Long opportunityId) {
        return find("studentId = ?1 and opportunityId = ?2", studentId, opportunityId).firstResult();
    }

    public List<InternshipRegistration> findByStudentId(Long studentId) {
        return find("studentId", studentId).list();
    }

    public List<InternshipRegistration> findByCompanyId(Long companyId) {
        return find("companyId", companyId).list();
    }

    public List<InternshipRegistration> findByLecturerId(Long lecturerId) {
        return find("lecturerId", lecturerId).list();
    }

    public long countByPeriodIdAndLecturerId(Long periodId, Long lecturerId) {
        return count("periodId = ?1 and lecturerId = ?2", periodId, lecturerId);
    }
}
