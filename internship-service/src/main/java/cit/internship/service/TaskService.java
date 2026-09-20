package cit.internship.service;

import cit.internship.entity.Task;
import cit.internship.entity.TaskStatus;
import cit.internship.repository.TaskRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.LocalDate;
import java.util.List;

@ApplicationScoped
public class TaskService {

    @Inject
    TaskRepository taskRepository;

    public Task getTaskById(Long id) {
        return taskRepository.findById(id);
    }

    public List<Task> getTasksByWorkPlanId(Long workPlanId) {
        return taskRepository.findByWorkPlanId(workPlanId);
    }

    @Transactional
    public Task createTask(
            Long workPlanId,
            String title,
            String description,
            LocalDate startDate,
            LocalDate dueDate
    ) {
        Task task = new Task();

        task.setWorkPlanId(workPlanId);
        task.setTitle(title);
        task.setDescription(description);
        task.setStartDate(startDate);
        task.setDueDate(dueDate);
        task.setStatus(TaskStatus.TODO);

        taskRepository.persist(task);

        return task;
    }

    @Transactional
    public Task updateTaskStatus(Long id, TaskStatus status) {
        Task task = taskRepository.findById(id);

        if (task == null) {
            return null;
        }

        task.setStatus(status);

        return task;
    }
}