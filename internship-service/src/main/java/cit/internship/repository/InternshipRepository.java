package cit.internship.repository;

import cit.internship.entity.Internship;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class InternshipRepository implements PanacheRepository<Internship> {

    public List<Internship> findByStudentId(Long studentId) {
        return find("studentId", studentId).list();
    }

    public List<Internship> findByCompanyId(Long companyId) {
        return find("companyId", companyId).list();
    }

    public List<Internship> findByLecturerId(Long lecturerId) {
        return find("lecturerId", lecturerId).list();
    }

}