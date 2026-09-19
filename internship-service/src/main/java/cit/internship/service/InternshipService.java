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

    public List<Internship> getInternshipByStudentId(Long studentId) {
        return internshipRepository.findByStudentId(studentId);
    }

    public List<Internship> getInternshipsByCompanyId(Long companyId) {
        return internshipRepository.findByCompanyId(companyId);
    }

    public List<Internship> getInternshipsByLecturerId(Long lecturerId) {
        return internshipRepository.findByLecturerId(lecturerId);
    }

    public boolean canViewInternship(
            Internship internship,
            String role,
            Long userId) {

        if (internship == null) {
            return false;
        }

        switch (role) {
            case "STUDENT":
                return internship.getStudentId().equals(userId);

            case "COMPANY":
                return internship.getCompanyId() != null
                        && internship.getCompanyId().equals(userId);

            case "LECTURER":
                return internship.getLecturerId() != null
                        && internship.getLecturerId().equals(userId);

            case "ADMIN":
                return true;

            default:
                return false;
        }
    }

    @Transactional
    public Internship createInternship(InternshipRequest request, Long studentId) {

        Internship internship = new Internship();

        internship.setStudentId(studentId);
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

    @Transactional
    public Internship approveByCompany(Long id, Long companyId) {
        Internship internship = internshipRepository.findById(id);

        if (internship == null) {
            return null;
        }

        if (internship.getStatus() != InternshipStatus.PENDING_COMPANY) {
            throw new IllegalArgumentException(
                    "Internship is not waiting for company approval"
            );
        }

        internship.setCompanyId(companyId);
        internship.setStatus(InternshipStatus.PENDING_LECTURER);

        return internship;
    }

    @Transactional
    public Internship approveByLecturer(Long id, Long lecturerId) {
        Internship internship = internshipRepository.findById(id);

        if (internship == null) {
            return null;
        }

        if (internship.getStatus() != InternshipStatus.PENDING_LECTURER) {
            throw new IllegalArgumentException(
                    "Internship is not waiting for lecturer approval"
            );
        }

        internship.setLecturerId(lecturerId);
        internship.setStatus(InternshipStatus.APPROVED);

        return internship;
    }
}