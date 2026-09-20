package cit.internship.controller;

import cit.internship.dto.WorkPlanRequest;
import cit.internship.entity.Internship;
import cit.internship.entity.WorkPlan;
import cit.internship.service.CurrentUserService;
import cit.internship.service.InternshipService;
import cit.internship.service.WorkPlanService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import io.quarkus.security.Authenticated;

import java.util.Map;

@Path("/api/work-plans")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
public class WorkPlanController {

    @Inject
    WorkPlanService workPlanService;

    @Inject
    InternshipService internshipService;

    @Inject
    CurrentUserService currentUserService;

    @POST
    @Path("/{internshipId}")
    @RolesAllowed("COMPANY")
    public Response createWorkPlan(
            @PathParam("internshipId") Long internshipId,
            @Valid WorkPlanRequest request
    ) {
        Long companyId = currentUserService.getUserId();

        Internship internship =
                internshipService.getInternshipById(internshipId);

        if (internship == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of(
                            "status", 404,
                            "message", "Internship not found"
                    ))
                    .build();
        }

        if (internship.getCompanyId() == null
                || !internship.getCompanyId().equals(companyId)) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity(Map.of(
                            "status", 403,
                            "message", "You do not have permission to create a work plan for this internship"
                    ))
                    .build();
        }

        WorkPlan workPlan = workPlanService.createWorkPlan(
                internshipId,
                request.getTitle(),
                request.getDescription(),
                request.getStartDate(),
                request.getEndDate()
        );

        return Response.status(Response.Status.CREATED)
                .entity(workPlan)
                .build();
    }

    @GET
    @Path("/{internshipId}")
    public Response getWorkPlan(
            @PathParam("internshipId") Long internshipId
    ) {
        WorkPlan workPlan =
                workPlanService.getWorkPlanByInternshipId(internshipId);

        if (workPlan == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(Map.of(
                            "status", 404,
                            "message", "Work plan not found"
                    ))
                    .build();
        }

        return Response.ok(workPlan).build();
    }



}