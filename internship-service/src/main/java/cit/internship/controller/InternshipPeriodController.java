package cit.internship.controller;

import cit.internship.dto.AssignLecturerRequest;
import cit.internship.dto.InternshipPeriodRequest;
import cit.internship.entity.InternshipPeriodLecturer;
import cit.internship.service.InternshipPeriodService;
import io.quarkus.security.Authenticated;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/api/internship-periods")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
public class InternshipPeriodController {

    @Inject
    InternshipPeriodService internshipPeriodService;

    @GET
    public Response getAllPeriods() {
        return Response.ok(internshipPeriodService.getAllPeriods()).build();
    }

    @GET
    @Path("/{id}")
    public Response getPeriodById(@PathParam("id") Long id) {
        return Response.ok(internshipPeriodService.getPeriodById(id)).build();
    }

    @POST
    @RolesAllowed("ADMIN")
    public Response createPeriod(@Valid InternshipPeriodRequest request) {
        return Response.status(Response.Status.CREATED)
                .entity(internshipPeriodService.createPeriod(request))
                .build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed("ADMIN")
    public Response updatePeriod(@PathParam("id") Long id, @Valid InternshipPeriodRequest request) {
        return Response.ok(internshipPeriodService.updatePeriod(id, request)).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed("ADMIN")
    public Response deletePeriod(@PathParam("id") Long id) {
        internshipPeriodService.deletePeriod(id);
        return Response.noContent().build();
    }

    @GET
    @Path("/{periodId}/lecturers")
    public Response getAssignedLecturers(@PathParam("periodId") Long periodId) {
        List<InternshipPeriodLecturer> assignments = internshipPeriodService.getAssignedLecturers(periodId);
        return Response.ok(assignments).build();
    }

    @POST
    @Path("/{periodId}/lecturers")
    @RolesAllowed("ADMIN")
    public Response assignLecturer(
            @PathParam("periodId") Long periodId,
            @Valid AssignLecturerRequest request
    ) {
        return Response.status(Response.Status.CREATED)
                .entity(internshipPeriodService.assignLecturer(periodId, request))
                .build();
    }

    @DELETE
    @Path("/{periodId}/lecturers/{lecturerId}")
    @RolesAllowed("ADMIN")
    public Response removeAssignedLecturer(
            @PathParam("periodId") Long periodId,
            @PathParam("lecturerId") Long lecturerId
    ) {
        internshipPeriodService.removeAssignedLecturer(periodId, lecturerId);
        return Response.noContent().build();
    }
}
