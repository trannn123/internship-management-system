package cit.evaluation.controller;

import cit.evaluation.dto.LecturerEvaluationRequest;
import cit.evaluation.entity.LecturerEvaluation;
import cit.evaluation.service.CurrentUserService;
import cit.evaluation.service.LecturerEvaluationService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/lecturer-evaluations")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class LecturerEvaluationController {

    @Inject
    LecturerEvaluationService lecturerEvaluationService;

    @Inject
    CurrentUserService currentUserService;

    @POST
    @Path("/{internshipId}")
    @RolesAllowed("LECTURER")
    public Response createEvaluation(
            @PathParam("internshipId") Long internshipId,
            @Valid LecturerEvaluationRequest request
    ) {
        Long lecturerId = currentUserService.getUserId();

        LecturerEvaluation evaluation =
                lecturerEvaluationService.createEvaluation(
                        internshipId,
                        lecturerId,
                        request
                );

        return Response.status(Response.Status.CREATED)
                .entity(evaluation)
                .build();
    }

    @GET
    @Path("/{internshipId}")
    @RolesAllowed({"LECTURER", "COMPANY"})
    public Response getEvaluation(
            @PathParam("internshipId") Long internshipId
    ) {
        String role = currentUserService.getRole();
        Long userId = currentUserService.getUserId();

        boolean canView =
                lecturerEvaluationService.canViewEvaluation(
                        internshipId,
                        userId,
                        role
                );

        if (!canView) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"message\":\"You do not have permission to view this evaluation\"}")
                    .build();
        }

        LecturerEvaluation evaluation =
                lecturerEvaluationService.getEvaluationByInternshipId(
                        internshipId
                );

        if (evaluation == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"message\":\"Lecturer evaluation not found\"}")
                    .build();
        }

        return Response.ok(evaluation).build();
    }
}