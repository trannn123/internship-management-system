package cit.evaluation.client.user;


import cit.evaluation.client.AuthorizationHeadersFactory;
import cit.evaluation.dto.MeResponse;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.annotation.RegisterClientHeaders;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

@Path("/api/users")
@RegisterRestClient(configKey = "user-service")
@RegisterClientHeaders(AuthorizationHeadersFactory.class)
@Produces(MediaType.APPLICATION_JSON)
public interface UserServiceClient {

    @GET
    @Path("/{id}")
    UserResponse getUserById(@PathParam("id") Long id);

    @GET
    @Path("/me")
    MeResponse getCurrentUser();
}