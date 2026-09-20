package cit.internship.client.evaluation;

import cit.internship.client.user.UserServiceClientHeadersFactory;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.annotation.RegisterClientHeaders;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

@Path("/api")
@RegisterRestClient(configKey = "evaluation-service")
@RegisterClientHeaders(UserServiceClientHeadersFactory.class)
@Produces(MediaType.APPLICATION_JSON)
public interface EvaluationServiceClient {

    @GET
    @Path("/evaluation-summaries/{internshipId}/exists")
    EvaluationExistenceResponse getEvaluationExistence(@PathParam("internshipId") Long internshipId);
}
