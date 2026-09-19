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
import cit.internship.dto.MeResponse;
import cit.internship.client.user.UserServiceClient;
import org.eclipse.microprofile.rest.client.inject.RestClient;

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
        return internshipService.getAllInternships();
    }

    @GET
    @Path("/{id}")
    public Response getInternshipById(@PathParam("id") Long id) {
        Internship internship = internshipService.getInternshipById(id);

        if (internship == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok(internship).build();
    }

    private Long extractStudentId(MeResponse me) {
        if (!(me.getProfile() instanceof Map)) {
            throw new IllegalArgumentException("Invalid student profile");
        }

        Map<?, ?> profile = (Map<?, ?>) me.getProfile();

        Object id = profile.get("id");

        if (!(id instanceof Number)) {
            throw new IllegalArgumentException("Student ID not found");
        }

        return ((Number) id).longValue();
    }

    @POST
    @RolesAllowed("STUDENT")
    public Response createInternship(@Valid InternshipRequest request) {

        Long studentId = currentUserService.getUserId();

        Internship internship =
                internshipService.createInternship(request, studentId);

        return Response.status(Response.Status.CREATED)
                .entity(internship)
                .build();
    }

    private Long extractCompanyId(MeResponse me) {
        if (!(me.getProfile() instanceof Map)) {
            throw new IllegalArgumentException("Invalid company profile");
        }

        Map<?, ?> profile = (Map<?, ?>) me.getProfile();

        Object id = profile.get("id");

        if (!(id instanceof Number)) {
            throw new IllegalArgumentException("Company ID not found");
        }

        return ((Number) id).longValue();
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

    private Long extractLecturerId(MeResponse me) {
        if (!(me.getProfile() instanceof Map)) {
            throw new IllegalArgumentException("Invalid lecturer profile");
        }

        Map<?, ?> profile = (Map<?, ?>) me.getProfile();

        Object id = profile.get("id");

        if (!(id instanceof Number)) {
            throw new IllegalArgumentException("Lecturer ID not found");
        }

        return ((Number) id).longValue();
    }

    @PUT
    @Path("/{id}/approve-lecturer")
    @RolesAllowed("LECTURER")
    public Response approveByLecturer(@PathParam("id") Long id) {
        MeResponse me = currentUserService.getCurrentUser();

        if (me == null || me.getProfile() == null) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("Lecturer profile not found")
                    .build();
        }

        Long lecturerId = extractLecturerId(me);

        Internship internship =
                internshipService.approveByLecturer(id, lecturerId);

        if (internship == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok(internship).build();
    }

    @GET
    @Path("/me")
    @RolesAllowed("STUDENT")
    public Response getMyInternships() {

        Long studentId = currentUserService.getUserId();

        List<Internship> internships = internshipService.getInternshipByStudentId(studentId);

        return Response.ok(internships).build();
    }
}