package cit.internship.repository;

import cit.internship.entity.Internship;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class InternshipRepository implements PanacheRepository<Internship> {
}