package cit.evaluation.controller;

import cit.evaluation.dto.EvaluationExistenceResponse;
import cit.evaluation.dto.EvaluationSummaryResponse;
import cit.evaluation.service.CurrentUserService;
import cit.evaluation.service.EvaluationSummaryService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/evaluation-summaries")
@Produces(MediaType.APPLICATION_JSON)
public class EvaluationSummaryController {

    @Inject
    EvaluationSummaryService evaluationSummaryService;

    @Inject
    CurrentUserService currentUserService;

    @GET
    @Path("/{internshipId}")
    @RolesAllowed({"STUDENT", "COMPANY", "LECTURER"})
    public Response getSummary(
            @PathParam("internshipId") Long internshipId
    ) {
        String role = currentUserService.getRole();
        Long userId = currentUserService.getUserId();

        boolean canView =
                evaluationSummaryService.canViewSummary(
                        internshipId,
                        userId,
                        role
                );

        if (!canView) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"message\":\"You do not have permission to view this evaluation summary\"}")
                    .build();
        }

        EvaluationSummaryResponse response =
                evaluationSummaryService.getSummary(internshipId);

        return Response.ok(response).build();
    }

    @GET
    @Path("/{internshipId}/exists")
    @RolesAllowed({"ADMIN", "COMPANY", "LECTURER"})
    public Response getEvaluationExistence(
            @PathParam("internshipId") Long internshipId
    ) {
        String role = currentUserService.getRole();
        Long userId = "ADMIN".equals(role)
                ? null
                : currentUserService.getUserId();

        boolean canView =
                evaluationSummaryService.canViewSummary(
                        internshipId,
                        userId,
                        role
                );

        if (!canView) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"message\":\"You do not have permission to view this evaluation summary\"}")
                    .build();
        }

        EvaluationExistenceResponse response =
                evaluationSummaryService.getEvaluationExistence(
                        internshipId
                );

        return Response.ok(response).build();
    }
}