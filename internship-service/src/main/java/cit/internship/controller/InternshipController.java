package cit.internship.controller;

import cit.internship.dto.InternshipRequest;
import cit.internship.entity.Internship;
import cit.internship.service.CurrentUserService;
import cit.internship.service.InternshipService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import io.quarkus.security.Authenticated;

import java.util.List;
import java.util.Map;

@Path("/api/internships")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
public class InternshipController {

    @Inject
    InternshipService internshipService;

    @Inject
    CurrentUserService currentUserService;

    @GET
    public List<Internship> getAllInternships() {
        String role = currentUserService.getRole();

        if ("ADMIN".equals(role)) {
            return internshipService.getAllInternships();
        }

        Long userId = currentUserService.getUserId();

        switch (role) {
            case "STUDENT":
                return internshipService.getInternshipByStudentId(userId);

            case "COMPANY":
                return internshipService.getInternshipsByCompanyId(userId);

            case "LECTURER":
                return internshipService.getInternshipsByLecturerId(userId);

            default:
                return List.of();
        }
    }

    @GET
    @Path("/{id}")
    public Response getInternshipById(@PathParam("id") Long id) {

        Internship internship = internshipService.getInternshipById(id);

        if (internship == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        Long userId = currentUserService.getUserId();
        String role = currentUserService.getRole();

        boolean canView = internshipService.canViewInternship(
                internship,
                role,
                userId
        );

        if (!canView) {
            return Response.status(Response.Status.FORBIDDEN)
                    .entity(Map.of(
                            "status", 403,
                            "message", "You do not have permission to view this internship"
                    ))
                    .build();
        }

        return Response.ok(internship).build();
    }

    @POST
    @RolesAllowed("ADMIN")
    public Response createInternship(@Valid InternshipRequest request) {
        if (request.getStudentId() == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of(
                            "status", 400,
                            "message", "studentId is required for admin-created internships"
                    ))
                    .build();
        }

        // Students must use /api/internship-registrations so company/lecturer assignments are derived server-side from the official workflow.
        Internship internship =
                internshipService.createInternship(request, request.getStudentId());

        return Response.status(Response.Status.CREATED)
                .entity(internship)
                .build();
    }

    @PUT
    @Path("/{id}/approve-company")
    @RolesAllowed("COMPANY")
    public Response approveByCompany(@PathParam("id") Long id) {

        Long companyId = currentUserService.getUserId();

        Internship internship = internshipService.approveByCompany(id, companyId);

        if (internship == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok(internship).build();
    }

    @PUT
    @Path("/{id}/reject-company")
    @RolesAllowed("COMPANY")
    public Response rejectByCompany(@PathParam("id") Long id) {

        Long companyId = currentUserService.getUserId();

        Internship internship =
                internshipService.rejectByCompany(id, companyId);

        if (internship == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok(internship).build();
    }

    @PUT
    @Path("/{id}/approve-lecturer")
    @RolesAllowed("LECTURER")
    public Response approveByLecturer(@PathParam("id") Long id) {

        Long lecturerId = currentUserService.getUserId();

        Internship internship =
                internshipService.approveByLecturer(id, lecturerId);

        if (internship == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok(internship).build();
    }

    @PUT
    @Path("/{id}/reject-lecturer")
    @RolesAllowed("LECTURER")
    public Response rejectByLecturer(@PathParam("id") Long id) {

        Long lecturerId = currentUserService.getUserId();

        Internship internship =
                internshipService.rejectByLecturer(id, lecturerId);

        if (internship == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok(internship).build();
    }

    @PUT
    @Path("/{id}/complete-company")
    @RolesAllowed("COMPANY")
    public Response completeByCompany(@PathParam("id") Long id) {
        Long companyId = currentUserService.getUserId();

        Internship internship = internshipService.completeByCompany(id, companyId);

        if (internship == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok(internship).build();
    }

    @PUT
    @Path("/{id}/complete-lecturer")
    @RolesAllowed("LECTURER")
    public Response completeByLecturer(@PathParam("id") Long id) {
        Long lecturerId = currentUserService.getUserId();

        Internship internship = internshipService.completeByLecturer(id, lecturerId);

        if (internship == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok(internship).build();
    }

    @GET
    @Path("/me/student")
    @RolesAllowed("STUDENT")
    public Response getMyInternships() {

        Long studentId = currentUserService.getUserId();

        List<Internship> internships = internshipService.getInternshipByStudentId(studentId);

        return Response.ok(internships).build();
    }

    @GET
    @Path("/me/company")
    @RolesAllowed("COMPANY")
    public Response getMyCompanyInternships() {
        Long companyId = currentUserService.getUserId();

        List<Internship> internships = internshipService.getInternshipsByCompanyId(companyId);

        return Response.ok(internships).build();
    }

    @GET
    @Path("/me/lecturer")
    @RolesAllowed("LECTURER")
    public Response getMyLecturerInternships() {
        Long lecturerId = currentUserService.getUserId();

        List<Internship> internships = internshipService.getInternshipsByLecturerId(lecturerId);

        return Response.ok(internships).build();
    }

}