package cit.internship.repository;

import cit.internship.entity.Task;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class TaskRepository implements PanacheRepository<Task> {

    public List<Task> findByWorkPlanId(Long workPlanId) {
        return find("workPlanId", workPlanId).list();
    }
}