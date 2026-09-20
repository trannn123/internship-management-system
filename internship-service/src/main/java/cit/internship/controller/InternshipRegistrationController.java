package cit.internship.controller;

import cit.internship.dto.InternshipRegistrationRequest;
import cit.internship.service.CurrentUserService;
import cit.internship.service.InternshipRegistrationService;
import io.quarkus.security.Authenticated;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/internship-registrations")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
public class InternshipRegistrationController {

    @Inject
    InternshipRegistrationService internshipRegistrationService;

    @Inject
    CurrentUserService currentUserService;

    @GET
    public Response getRegistrations() {
        return Response.ok(internshipRegistrationService.getVisibleRegistrations()).build();
    }

    @GET
    @Path("/{id}")
    public Response getRegistrationById(@PathParam("id") Long id) {
        return Response.ok(internshipRegistrationService.getVisibleRegistrationById(id)).build();
    }

    @POST
    @RolesAllowed("STUDENT")
    public Response createRegistration(@Valid InternshipRegistrationRequest request) {
        return Response.status(Response.Status.CREATED)
                .entity(internshipRegistrationService.createRegistration(request))
                .build();
    }

    @PUT
    @Path("/{id}/company/approve")
    @RolesAllowed("COMPANY")
    public Response approveByCompany(@PathParam("id") Long id) {
        return Response.ok(internshipRegistrationService.approveByCompany(id)).build();
    }

    @PUT
    @Path("/{id}/company/reject")
    @RolesAllowed("COMPANY")
    public Response rejectByCompany(@PathParam("id") Long id) {
        return Response.ok(internshipRegistrationService.rejectByCompany(id)).build();
    }

    @PUT
    @Path("/{id}/lecturer/approve")
    @RolesAllowed("LECTURER")
    public Response approveByLecturer(@PathParam("id") Long id) {
        return Response.ok(internshipRegistrationService.approveByLecturer(id)).build();
    }

    @PUT
    @Path("/{id}/lecturer/reject")
    @RolesAllowed("LECTURER")
    public Response rejectByLecturer(@PathParam("id") Long id) {
        return Response.ok(internshipRegistrationService.rejectByLecturer(id)).build();
    }

    @PUT
    @Path("/{id}/complete")
    @RolesAllowed({"COMPANY", "LECTURER", "ADMIN"})
    public Response completeRegistration(@PathParam("id") Long id) {
        return Response.ok(internshipRegistrationService.completeRegistration(id)).build();
    }

    @PUT
    @Path("/complete-company-evaluation/{internshipId}")
    @RolesAllowed("COMPANY")
    public Response completeByCompanyEvaluation(@PathParam("internshipId") Long internshipId) {
        Long companyId = currentUserService.getUserId();
        return Response.ok(
                internshipRegistrationService.completeByCompanyEvaluation(internshipId, companyId)
        ).build();
    }
}
