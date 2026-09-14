package cit.internship.controller;

import cit.internship.entity.User;
import cit.internship.service.UserService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import cit.internship.dto.UserRequest;
import jakarta.ws.rs.core.Response;
import jakarta.validation.Valid;
import io.quarkus.security.Authenticated;

import java.util.List;

@Path("/api/users")
@Produces(MediaType.APPLICATION_JSON)
@Authenticated
public class UserController {

    @Inject
    UserService userService;

    @GET
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GET
    @Path("/{id}")
    public Response getUserById(@PathParam("id") Long id) {
        User user = userService.getUserById(id);

        if (user == null) {
            return Response
                    .status(Response.Status.NOT_FOUND)
                    .build();
        }

        return Response
                .ok(user)
                .build();
    }

    @POST
    public Response createUser(@Valid UserRequest request) {
        User user = userService.createUser(request);

        return Response
                .status(Response.Status.CREATED)
                .entity(user)
                .build();
    }

    @PUT
    @Path("/{id}")
    public Response updateUser(
            @PathParam("id") Long id,
            @Valid UserRequest request) {

        User user = userService.updateUser(id, request);

        if (user == null) {
            return Response
                    .status(Response.Status.NOT_FOUND)
                    .build();
        }

        return Response
                .ok(user)
                .build();
    }

    @DELETE
    @Path("/{id}")
    public Response deleteUser(@PathParam("id") Long id) {

        boolean deleted = userService.deleteUser(id);

        if (!deleted) {
            return Response
                    .status(Response.Status.NOT_FOUND)
                    .build();
        }

        return Response
                .noContent()
                .build();
    }
}