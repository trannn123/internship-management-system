package cit.internship.client.user;

import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.annotation.RegisterClientHeaders;
import cit.internship.dto.MeResponse;

@Path("/api/users")
@RegisterRestClient(configKey = "user-service")
@RegisterClientHeaders(UserServiceClientHeadersFactory.class)
@Produces(MediaType.APPLICATION_JSON)
public interface UserServiceClient {

    @GET
    @Path("/{id}")
    UserResponse getUserById(@PathParam("id") Long id);

    @GET
    @Path("/me")
    MeResponse getCurrentUser();
}