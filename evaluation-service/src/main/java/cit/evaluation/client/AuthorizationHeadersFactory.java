package cit.evaluation.client;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.ws.rs.core.MultivaluedHashMap;
import jakarta.ws.rs.core.MultivaluedMap;
import org.eclipse.microprofile.rest.client.ext.ClientHeadersFactory;

@ApplicationScoped
public class AuthorizationHeadersFactory implements ClientHeadersFactory {

    @Override
    public MultivaluedMap<String, String> update(
            MultivaluedMap<String, String> incomingHeaders,
            MultivaluedMap<String, String> clientOutgoingHeaders) {

        MultivaluedMap<String, String> headers =
                new MultivaluedHashMap<>();

        String authorization =
                incomingHeaders.getFirst("Authorization");

        if (authorization != null) {
            headers.putSingle("Authorization", authorization);
        }

        return headers;
    }
}