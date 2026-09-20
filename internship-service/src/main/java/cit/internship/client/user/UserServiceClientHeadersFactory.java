package cit.internship.client.user;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.core.MultivaluedHashMap;
import jakarta.ws.rs.core.MultivaluedMap;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.eclipse.microprofile.rest.client.ext.ClientHeadersFactory;
import jakarta.inject.Inject;

@ApplicationScoped
public class UserServiceClientHeadersFactory implements ClientHeadersFactory {

    @Inject
    JsonWebToken jwt;

    @Override
    public MultivaluedMap<String, String> update(
            MultivaluedMap<String, String> incomingHeaders,
            MultivaluedMap<String, String> clientOutgoingHeaders) {

        MultivaluedMap<String, String> headers = new MultivaluedHashMap<>();

        String authorization = incomingHeaders.getFirst("Authorization");

        if (authorization != null) {
            headers.putSingle("Authorization", authorization);
        }

        return headers;
    }
}