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
    @Path("/lecturers")
    @RolesAllowed("ADMIN")
    public List<cit.internship.dto.LecturerSummaryResponse> getAllLecturers() {
        return userService.getAllLecturers()
                .stream()
                .map(lecturer -> new cit.internship.dto.LecturerSummaryResponse(
                        lecturer.getId(),
                        lecturer.getUser() != null ? lecturer.getUser().getId() : null,
                        lecturer.getUser() != null ? lecturer.getUser().getFullName() : null,
                        lecturer.getUser() != null ? lecturer.getUser().getEmail() : null,
                        lecturer.getLecturerCode(),
                        lecturer.getDepartment()
                ))
                .toList();
    }

    @GET
    @Path("/me")
    public Response getCurrentUser() {
        String keycloakUserId = jwt.getSubject();
        // NOTE: JsonWebToken.getName() maps to the MP-JWT "upn" claim (Keycloak
        // defaults this to the username), NOT the OIDC "name" claim. Read the
        // "name" claim explicitly to get the user's actual first + last name,
        // falling back to the username-based upn only if it's missing.
        String fullName = jwt.getClaim("name");
        if (fullName == null || fullName.isBlank()) {
            fullName = jwt.getName();
        }
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
    @Path("/lecturers/{id}")
    public Response getLecturerById(@PathParam("id") Long id) {
        cit.internship.entity.Lecturer lecturer = userService.getLecturerById(id);

        if (lecturer == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok(new cit.internship.dto.LecturerSummaryResponse(
                lecturer.getId(),
                lecturer.getUser() != null ? lecturer.getUser().getId() : null,
                lecturer.getUser() != null ? lecturer.getUser().getFullName() : null,
                lecturer.getUser() != null ? lecturer.getUser().getEmail() : null,
                lecturer.getLecturerCode(),
                lecturer.getDepartment()
        )).build();
    }

    @GET
    @Path("/students/{id}")
    public Response getStudentById(@PathParam("id") Long id) {
        cit.internship.entity.Student student = userService.getStudentById(id);

        if (student == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok(new cit.internship.dto.StudentSummaryResponse(
                student.getId(),
                student.getUser() != null ? student.getUser().getId() : null,
                student.getUser() != null ? student.getUser().getFullName() : null,
                student.getUser() != null ? student.getUser().getEmail() : null,
                student.getStudentCode(),
                student.getClassName(),
                student.getMajor()
        )).build();
    }

    @GET
    @Path("/companies/{id}")
    public Response getCompanyById(@PathParam("id") Long id) {
        cit.internship.entity.Company company = userService.getCompanyById(id);

        if (company == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        return Response.ok(new cit.internship.dto.CompanySummaryResponse(
                company.getId(),
                company.getUser() != null ? company.getUser().getId() : null,
                company.getUser() != null ? company.getUser().getFullName() : null,
                company.getUser() != null ? company.getUser().getEmail() : null,
                company.getCompanyName(),
                company.getTaxCode(),
                company.getAddress(),
                company.getPhone()
        )).build();
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