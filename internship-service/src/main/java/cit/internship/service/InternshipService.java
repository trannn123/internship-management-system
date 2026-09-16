package cit.internship.service;

import cit.internship.dto.InternshipRequest;
import cit.internship.entity.Internship;
import cit.internship.entity.InternshipStatus;
import cit.internship.repository.InternshipRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;

@ApplicationScoped
public class InternshipService {

    @Inject
    InternshipRepository internshipRepository;

    public List<Internship> getAllInternships() {
        return internshipRepository.listAll();
    }

    public Internship getInternshipById(Long id) {
        return internshipRepository.findById(id);
    }

    @Transactional
    public Internship createInternship(InternshipRequest request) {

        Internship internship = new Internship();

        internship.setStudentId(request.getStudentId());
        internship.setCompanyId(request.getCompanyId());
        internship.setLecturerId(request.getLecturerId());
        internship.setPosition(request.getPosition());
        internship.setDescription(request.getDescription());
        internship.setStartDate(request.getStartDate());
        internship.setEndDate(request.getEndDate());

        if (request.getCompanyId() == null) {
            internship.setStatus(InternshipStatus.PENDING_COMPANY);
        } else {
            internship.setStatus(InternshipStatus.PENDING_LECTURER);
        }

        internshipRepository.persist(internship);

        return internship;
    }
}