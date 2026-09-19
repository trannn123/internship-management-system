package cit.internship.service;

import cit.internship.client.user.UserServiceClient;
import cit.internship.dto.MeResponse;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.rest.client.inject.RestClient;

import java.util.Map;

@ApplicationScoped
public class CurrentUserService {

    @Inject
    @RestClient
    UserServiceClient userServiceClient;

    public MeResponse getCurrentUser() {
        return userServiceClient.getCurrentUser();
    }

    public Long getUserId() {
        MeResponse me = getCurrentUser();

        if (me == null || me.getProfile() == null) {
            throw new IllegalStateException("User profile not found");
        }

        if (!(me.getProfile() instanceof Map)) {
            throw new IllegalStateException("Invalid user profile");
        }

        Map<?, ?> profile = (Map<?, ?>) me.getProfile();

        Object id = profile.get("id");

        if (!(id instanceof Number)) {
            throw new IllegalStateException("User ID not found");
        }

        return ((Number) id).longValue();
    }
}