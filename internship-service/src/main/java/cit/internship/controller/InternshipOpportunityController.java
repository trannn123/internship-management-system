package cit.internship.controller;

import cit.internship.dto.InternshipOpportunityRequest;
import cit.internship.service.InternshipOpportunityService;
import io.quarkus.security.Authenticated;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/internship-opportunities")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
public class InternshipOpportunityController {

    @Inject
    InternshipOpportunityService internshipOpportunityService;

    @GET
    public Response getAllOpportunities() {
        return Response.ok(internshipOpportunityService.getVisibleOpportunities()).build();
    }

    @GET
    @Path("/{id}")
    public Response getOpportunityById(@PathParam("id") Long id) {
        return Response.ok(internshipOpportunityService.getOpportunityById(id)).build();
    }

    @POST
    @RolesAllowed("COMPANY")
    public Response createOpportunity(@Valid InternshipOpportunityRequest request) {
        return Response.status(Response.Status.CREATED)
                .entity(internshipOpportunityService.createOpportunity(request))
                .build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed("COMPANY")
    public Response updateOpportunity(
            @PathParam("id") Long id,
            @Valid InternshipOpportunityRequest request
    ) {
        return Response.ok(internshipOpportunityService.updateOpportunity(id, request)).build();
    }
}
