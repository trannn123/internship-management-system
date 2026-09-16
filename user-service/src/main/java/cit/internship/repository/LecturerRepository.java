package cit.internship.repository;

import cit.internship.entity.Lecturer;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class LecturerRepository implements PanacheRepository<Lecturer> {
}