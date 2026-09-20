package cit.evaluation.controller;

import cit.evaluation.dto.CompanyEvaluationRequest;
import cit.evaluation.entity.CompanyEvaluation;
import cit.evaluation.service.CompanyEvaluationService;
import cit.evaluation.service.CurrentUserService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/company-evaluations")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CompanyEvaluationController {

    @Inject
    CompanyEvaluationService companyEvaluationService;

    @Inject
    CurrentUserService currentUserService;

    @POST
    @Path("/{internshipId}")
    @RolesAllowed("COMPANY")
    public Response createEvaluation(
            @PathParam("internshipId") Long internshipId,
            @Valid CompanyEvaluationRequest request
    ) {
        Long companyId = currentUserService.getUserId();

        CompanyEvaluation evaluation =
                companyEvaluationService.createEvaluation(
                        internshipId,
                        companyId,
                        request
                );

        return Response.status(Response.Status.CREATED)
                .entity(evaluation)
                .build();
    }

    @GET
    @Path("/{internshipId}")
    @RolesAllowed({"COMPANY", "LECTURER"})
    public Response getEvaluation(
            @PathParam("internshipId") Long internshipId
    ) {
        String role = currentUserService.getRole();
        Long userId = currentUserService.getUserId();

        boolean canView =
                companyEvaluationService.canViewEvaluation(
                        internshipId,
                        userId,
                        role
                );

        if (!canView) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"message\":\"You do not have permission to view this evaluation\"}")
                    .build();
        }

        CompanyEvaluation evaluation =
                companyEvaluationService.getEvaluationByInternshipId(
                        internshipId
                );

        if (evaluation == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"message\":\"Company evaluation not found\"}")
                    .build();
        }

        return Response.ok(evaluation).build();
    }
}