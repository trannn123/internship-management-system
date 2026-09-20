package cit.internship.service;

import cit.internship.client.user.UserServiceClient;
import cit.internship.dto.MeResponse;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

@ApplicationScoped
public class CurrentUserService {

    private static final Logger log = LoggerFactory.getLogger(CurrentUserService.class);
    @Inject
    @RestClient
    UserServiceClient userServiceClient;

    public MeResponse getCurrentUser() {
        return userServiceClient.getCurrentUser();
    }

    public String getRole() {
        MeResponse me = getCurrentUser();

        if (me == null || me.getRole() == null) {
            throw new IllegalStateException("User role not found");
        }

        return me.getRole();
    }

    public Long getUserId() {
        MeResponse me = getCurrentUser();

        if (me == null) {
            throw new IllegalStateException("Current user not found");
        }

        if (me.getProfile() == null) {
            if ("ADMIN".equals(me.getRole()) && me.getId() != null) {
                return me.getId();
            }
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