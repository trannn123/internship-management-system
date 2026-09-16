package cit.internship.controller;

import cit.internship.dto.InternshipRequest;
import cit.internship.entity.Internship;
import cit.internship.service.InternshipService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import io.quarkus.security.Authenticated;

import java.util.List;

@Path("/api/internships")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
public class InternshipController {

    @Inject
    InternshipService internshipService;

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

    @POST
    public Response createInternship(@Valid InternshipRequest request) {

        Internship internship = internshipService.createInternship(request);

        return Response.status(Response.Status.CREATED)
                .entity(internship)
                .build();
    }
}