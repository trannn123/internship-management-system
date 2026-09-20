package cit.internship.controller;

import cit.internship.dto.InternshipLogRequest;
import cit.internship.entity.Internship;
import cit.internship.entity.InternshipLog;
import cit.internship.service.CurrentUserService;
import cit.internship.service.InternshipLogService;
import cit.internship.service.InternshipService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;

@Path("/api/internship-logs")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class InternshipLogController {

    @Inject
    InternshipLogService internshipLogService;

    @Inject
    InternshipService internshipService;

    @Inject
    CurrentUserService currentUserService;

    @POST
    @Path("/{internshipId}")
    @RolesAllowed("STUDENT")
    public Response createLog(
            @PathParam("internshipId") Long internshipId,
            @Valid InternshipLogRequest request
    ) {
        Long studentId = currentUserService.getUserId();

        Internship internship = internshipService.getInternshipById(internshipId);

        if (internship == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"message\":\"Internship not found\"}")
                    .build();
        }

        if (!internship.getStudentId().equals(studentId)) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"message\":\"You do not have permission\"}")
                    .build();
        }

        InternshipLog log =
                internshipLogService.createLog(internshipId, request);

        return Response.status(Response.Status.CREATED)
                .entity(log)
                .build();
    }

    @GET
    @Path("/{internshipId}")
    @RolesAllowed("STUDENT")
    public Response getLogs(
            @PathParam("internshipId") Long internshipId
    ) {
        Long studentId = currentUserService.getUserId();

        Internship internship = internshipService.getInternshipById(internshipId);

        if (internship == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"message\":\"Internship not found\"}")
                    .build();
        }

        if (!internship.getStudentId().equals(studentId)) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"message\":\"You do not have permission\"}")
                    .build();
        }

        List<InternshipLog> logs =
                internshipLogService.getLogsByInternshipId(internshipId);

        return Response.ok(logs).build();
    }

    @GET
    @Path("/company/{internshipId}")
    @RolesAllowed("COMPANY")
    public Response getLogsForCompany(
            @PathParam("internshipId") Long internshipId
    ) {
        Long companyId = currentUserService.getUserId();

        Internship internship = internshipService.getInternshipById(internshipId);

        if (internship == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"message\":\"Internship not found\"}")
                    .build();
        }

        if (internship.getCompanyId() == null
                || !internship.getCompanyId().equals(companyId)) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"message\":\"You do not have permission\"}")
                    .build();
        }

        List<InternshipLog> logs =
                internshipLogService.getLogsByInternshipId(internshipId);

        return Response.ok(logs).build();
    }


    @GET
    @Path("/lecturer/{internshipId}")
    @RolesAllowed("LECTURER")
    public Response getLogsForLecturer(
            @PathParam("internshipId") Long internshipId
    ) {
        Long lecturerId = currentUserService.getUserId();

        Internship internship = internshipService.getInternshipById(internshipId);

        if (internship == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("{\"message\":\"Internship not found\"}")
                    .build();
        }

        if (internship.getLecturerId() == null
                || !internship.getLecturerId().equals(lecturerId)) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity("{\"message\":\"You do not have permission\"}")
                    .build();
        }

        List<InternshipLog> logs =
                internshipLogService.getLogsByInternshipId(internshipId);

        return Response.ok(logs).build();
    }
}