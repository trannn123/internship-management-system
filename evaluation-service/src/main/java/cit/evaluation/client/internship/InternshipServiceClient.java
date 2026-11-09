package cit.evaluation.client.internship;

import cit.evaluation.client.AuthorizationHeadersFactory;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.annotation.RegisterClientHeaders;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

@Path("/api/internships")
@RegisterRestClient(configKey = "internship-service")
@RegisterClientHeaders(AuthorizationHeadersFactory.class)
@Produces(MediaType.APPLICATION_JSON)
public interface InternshipServiceClient {

    @GET
    @Path("/{id}")
    InternshipResponse getInternshipById(
            @PathParam("id") Long id
    );

    @GET
    @Path("/{id}/period-end-date")
    InternshipPeriodEndDateResponse getInternshipPeriodEndDate(
            @PathParam("id") Long id
    );
}