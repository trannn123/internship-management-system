package cit.internship.repository;

import cit.internship.entity.InternshipPeriod;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class InternshipPeriodRepository implements PanacheRepository<InternshipPeriod> {
}
