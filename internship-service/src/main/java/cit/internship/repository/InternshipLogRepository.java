package cit.internship.repository;

import cit.internship.entity.InternshipLog;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class InternshipLogRepository implements PanacheRepository<InternshipLog> {

    public List<InternshipLog> findByInternshipId(Long internshipId) {
        return find("internshipId", internshipId).list();
    }
}