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
import cit.internship.service.InternshipRegistrationService;

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
    InternshipRegistrationService internshipRegistrationService;

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

        if (request.getCompanyId() == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of(
                            "status", 400,
                            "message", "companyId is required"
                    ))
                    .build();
        }

        if (request.getLecturerId() == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of(
                            "status", 400,
                            "message", "lecturerId is required"
                    ))
                    .build();
        }

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

        Internship internship = internshipService.getInternshipById(id);

        if (internship == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        if (internship.getCompanyId() == null || !internship.getCompanyId().equals(companyId)) {
            throw new ForbiddenException(
                    "You do not have permission to complete this internship"
            );
        }

        if (internship.getRegistrationId() != null) {
            internshipRegistrationService.completeByCompanyEvaluation(id, companyId);
        } else {
            throw new BadRequestException(
                    "Completion of internships without registration is not supported yet"
            );
        }

        Internship updatedInternship = internshipService.getInternshipById(id);
        return Response.ok(updatedInternship).build();
    }


    @PUT
    @Path("/{id}/complete-lecturer")
    @RolesAllowed("LECTURER")
    public Response completeByLecturer(@PathParam("id") Long id) {
        Long lecturerId = currentUserService.getUserId();

        Internship internship = internshipService.getInternshipById(id);

        if (internship == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        if (internship.getLecturerId() == null || !internship.getLecturerId().equals(lecturerId)) {
            throw new ForbiddenException(
                    "You do not have permission to complete this internship"
            );
        }

        if (internship.getRegistrationId() != null) {
            internshipRegistrationService.completeRegistration(
                    internship.getRegistrationId()
            );
        } else {
            throw new BadRequestException(
                    "Completion of internships without registration is not supported yet"
            );
        }

        Internship updatedInternship = internshipService.getInternshipById(id);
        return Response.ok(updatedInternship).build();
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