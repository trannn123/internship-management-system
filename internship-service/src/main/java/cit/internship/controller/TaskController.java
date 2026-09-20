package cit.internship.controller;

import cit.internship.dto.TaskRequest;
import cit.internship.dto.TaskStatusRequest;
import cit.internship.entity.Task;
import cit.internship.service.CurrentUserService;
import cit.internship.service.InternshipService;
import cit.internship.service.TaskService;
import cit.internship.service.WorkPlanService;
import cit.internship.entity.WorkPlan;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import io.quarkus.security.Authenticated;

import java.util.List;
import java.util.Map;

@Path("/api/tasks")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
public class TaskController {

    @Inject
    TaskService taskService;

    @Inject
    WorkPlanService workPlanService;

    @Inject
    CurrentUserService currentUserService;

    @Inject
    InternshipService internshipService;

    @POST
    @Path("/{workPlanId}")
    @RolesAllowed("COMPANY")
    public Response createTask(
            @PathParam("workPlanId") Long workPlanId,
            @Valid TaskRequest request
    ) {
        Long companyId = currentUserService.getUserId();

        WorkPlan workPlan =
                workPlanService.getWorkPlanById(workPlanId);

        if (workPlan == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of(
                            "status", 404,
                            "message", "Work plan not found"
                    ))
                    .build();
        }

        boolean isOwner = internshipService.isCompanyOwner(
                workPlan.getInternshipId(),
                companyId
        );

        if (!isOwner) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity(Map.of(
                            "status", 403,
                            "message", "You do not have permission to add tasks to this work plan"
                    ))
                    .build();
        }

        Task task = taskService.createTask(
                workPlanId,
                request.getTitle(),
                request.getDescription(),
                request.getStartDate(),
                request.getDueDate()
        );

        return Response.status(Response.Status.CREATED)
                .entity(task)
                .build();
    }

    @GET
    @Path("/work-plan/{workPlanId}")
    public Response getTasksByWorkPlan(
            @PathParam("workPlanId") Long workPlanId
    ) {
        WorkPlan workPlan =
                workPlanService.getWorkPlanById(workPlanId);

        if (workPlan == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of(
                            "status", 404,
                            "message", "Work plan not found"
                    ))
                    .build();
        }

        List<Task> tasks =
                taskService.getTasksByWorkPlanId(workPlanId);

        return Response.ok(tasks).build();
    }

    @GET
    @Path("/{id}")
    public Response getTaskById(@PathParam("id") Long id) {
        Task task = taskService.getTaskById(id);

        if (task == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .build();
        }

        return Response.ok(task).build();
    }

    @PUT
    @Path("/{id}/status")
    @RolesAllowed("STUDENT")
    public Response updateTaskStatus(
            @PathParam("id") Long id,
            @Valid TaskStatusRequest request
    ) {
        Long studentId = currentUserService.getUserId();

        Task task = taskService.getTaskById(id);

        if (task == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of(
                            "status", 404,
                            "message", "Task not found"
                    ))
                    .build();
        }

        WorkPlan workPlan =
                workPlanService.getWorkPlanById(task.getWorkPlanId());

        if (workPlan == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of(
                            "status", 404,
                            "message", "Work plan not found"
                    ))
                    .build();
        }

        boolean isOwner = internshipService.isStudentOwner(
                workPlan.getInternshipId(),
                studentId
        );

        if (!isOwner) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity(Map.of(
                            "status", 403,
                            "message", "You do not have permission to update this task"
                    ))
                    .build();
        }

        Task updatedTask = taskService.updateTaskStatus(
                id,
                request.getStatus()
        );

        return Response.ok(updatedTask).build();
    }
}