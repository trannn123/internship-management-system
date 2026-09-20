package cit.internship.repository;

import cit.internship.entity.InternshipPeriodLecturer;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class InternshipPeriodLecturerRepository implements PanacheRepository<InternshipPeriodLecturer> {

    public List<InternshipPeriodLecturer> findByPeriodId(Long periodId) {
        return find("periodId", periodId).list();
    }

    public InternshipPeriodLecturer findByPeriodIdAndLecturerId(Long periodId, Long lecturerId) {
        return find("periodId = ?1 and lecturerId = ?2", periodId, lecturerId).firstResult();
    }
}
