package cit.internship.service;

import cit.internship.entity.WorkPlan;
import cit.internship.repository.WorkPlanRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class WorkPlanService {

    @Inject
    WorkPlanRepository workPlanRepository;

    public WorkPlan getWorkPlanById(Long id) {
        return workPlanRepository.findById(id);
    }

    public WorkPlan getWorkPlanByInternshipId(Long internshipId) {
        return workPlanRepository.findByInternshipId(internshipId);
    }

    @Transactional
    public WorkPlan createWorkPlan(
            Long internshipId,
            String title,
            String description,
            java.time.LocalDate startDate,
            java.time.LocalDate endDate
    ) {
        if (workPlanRepository.findByInternshipId(internshipId) != null) {
            throw new IllegalArgumentException(
                    "A work plan already exists for this internship"
            );
        }

        WorkPlan workPlan = new WorkPlan();

        workPlan.setInternshipId(internshipId);
        workPlan.setTitle(title);
        workPlan.setDescription(description);
        workPlan.setStartDate(startDate);
        workPlan.setEndDate(endDate);

        workPlanRepository.persist(workPlan);

        return workPlan;
    }
}