package cit.internship.repository;

import cit.internship.entity.WorkPlan;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class WorkPlanRepository implements PanacheRepository<WorkPlan> {

    public WorkPlan findByInternshipId(Long internshipId) {
        return find("internshipId", internshipId).firstResult();
    }
}