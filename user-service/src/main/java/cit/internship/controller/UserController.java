package cit.internship.controller;

import cit.internship.dto.MeResponse;
import cit.internship.entity.User;
import cit.internship.service.ProfileService;
import cit.internship.service.UserService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import cit.internship.dto.UserRequest;
import jakarta.ws.rs.core.Response;
import jakarta.validation.Valid;
import io.quarkus.security.Authenticated;
import jakarta.annotation.security.RolesAllowed;
import org.eclipse.microprofile.jwt.JsonWebToken;
import cit.internship.dto.StudentProfileRequest;
import cit.internship.dto.LecturerProfileRequest;
import cit.internship.dto.CompanyProfileRequest;

import java.util.List;

@Path("/api/users")
@Produces(MediaType.APPLICATION_JSON)
@Authenticated
public class UserController {
    @Inject
    JsonWebToken jwt;

    @Inject
    UserService userService;

    @Inject
    ProfileService profileService;

    @GET
    @RolesAllowed("ADMIN")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GET
    @Path("/me")
    public Response getCurrentUser() {
        String keycloakUserId = jwt.getSubject();
        String fullName = jwt.getName();
        String email = jwt.getClaim("email");

        String role = jwt.getGroups()
                .stream()
                .filter(group ->
                        group.equals("STUDENT")
                                || group.equals("LECTURER")
                                || group.equals("COMPANY")
                                || group.equals("ADMIN")
                )
                .findFirst()
                .orElse(null);

        if (role == null) {
            return Response
                    .status(Response.Status.FORBIDDEN)
                    .build();
        }

        User user = profileService.getOrCreateUser(
                keycloakUserId,
                fullName,
                email,
                role
        );

        Object profile = profileService.getProfile(
                user,
                role
        );

        MeResponse response = new MeResponse(
                user.getId(),
                user.getKeycloakUserId(),
                user.getFullName(),
                user.getEmail(),
                role,
                profile
        );

        return Response
                .ok(response)
                .build();
    }

    @PUT
    @Path("/me/profile/student")
    @RolesAllowed("STUDENT")
    public Response updateMyStudentProfile(@Valid StudentProfileRequest request) {
        String keycloakUserId = jwt.getSubject();

        User user = userService.getUserByKeycloakUserId(keycloakUserId);

        if (user == null) {
            return Response
                    .status(Response.Status.NOT_FOUND)
                    .build();
        }

        profileService.updateStudentProfile(user, request);

        Object profile = profileService.getProfile(user, "STUDENT");

        MeResponse response = new MeResponse(
                user.getId(),
                user.getKeycloakUserId(),
                user.getFullName(),
                user.getEmail(),
                "STUDENT",
                profile
        );

        return Response
                .ok(response)
                .build();
    }

    @PUT
    @Path("/me/profile/lecturer")
    @RolesAllowed("LECTURER")
    public Response updateMyLecturerProfile(@Valid LecturerProfileRequest request) {
        String keycloakUserId = jwt.getSubject();

        User user = userService.getUserByKeycloakUserId(keycloakUserId);

        if (user == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        profileService.updateLecturerProfile(user, request);

        Object profile = profileService.getProfile(user, "LECTURER");

        MeResponse response = new MeResponse(
                user.getId(),
                user.getKeycloakUserId(),
                user.getFullName(),
                user.getEmail(),
                "LECTURER",
                profile
        );

        return Response.ok(response).build();
    }

    @PUT
    @Path("/me/profile/company")
    @RolesAllowed("COMPANY")
    public Response updateMyCompanyProfile(@Valid CompanyProfileRequest request) {
        String keycloakUserId = jwt.getSubject();

        User user = userService.getUserByKeycloakUserId(keycloakUserId);

        if (user == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        profileService.updateCompanyProfile(user, request);

        Object profile = profileService.getProfile(user, "COMPANY");

        MeResponse response = new MeResponse(
                user.getId(),
                user.getKeycloakUserId(),
                user.getFullName(),
                user.getEmail(),
                "COMPANY",
                profile
        );

        return Response.ok(response).build();
    }

    @GET
    @Path("/{id}")
    @RolesAllowed({"ADMIN", "LECTURER"})
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
    @RolesAllowed("ADMIN")
    public Response createUser(@Valid UserRequest request) {
        User user = userService.createUser(request);

        return Response
                .status(Response.Status.CREATED)
                .entity(user)
                .build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed("ADMIN")
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
    @RolesAllowed("ADMIN")
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