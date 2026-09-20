package cit.internship.service;

import cit.internship.dto.InternshipRequest;
import cit.internship.entity.*;
import cit.internship.repository.InternshipRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@ApplicationScoped
public class InternshipService {

    private static final Logger log = LoggerFactory.getLogger(InternshipService.class);
    @Inject
    InternshipRepository internshipRepository;

    public List<Internship> getAllInternships() {
        return internshipRepository.listAll();
    }

    public Internship getInternshipById(Long id) {
        return internshipRepository.findById(id);
    }

    public Internship getInternshipByRegistrationId(Long registrationId) {
        return internshipRepository.findByRegistrationId(registrationId);
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
    public Internship createOrReuseFromRegistration(
            InternshipRegistration registration,
            InternshipOpportunity opportunity,
            InternshipPeriod period
    ) {
        Internship internship = internshipRepository.findByRegistrationId(registration.getId());
        boolean isNew = internship == null;

        if (isNew) {
            internship = new Internship();
            internship.setRegistrationId(registration.getId());
        }

        internship.setStudentId(registration.getStudentId());
        internship.setCompanyId(registration.getCompanyId());
        internship.setLecturerId(registration.getLecturerId());
        internship.setPosition(opportunity.getPosition());
        internship.setDescription(opportunity.getDescription());
        internship.setStartDate(period.getInternshipStartDate());
        internship.setEndDate(period.getInternshipEndDate());
        internship.setStatus(InternshipStatus.IN_PROGRESS);

        if (isNew) {
            internshipRepository.persist(internship);
        }

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
    public Internship rejectByCompany(Long id, Long companyId) {
        Internship internship = internshipRepository.findById(id);

        if (internship == null) {
            return null;
        }

        if (internship.getStatus() != InternshipStatus.PENDING_COMPANY) {
            throw new IllegalArgumentException(
                    "Internship is not waiting for company approval"
            );
        }

        if (internship.getCompanyId() != null
                && !internship.getCompanyId().equals(companyId)) {
            throw new IllegalArgumentException(
                    "You do not have permission to reject this internship"
            );
        }

        internship.setStatus(InternshipStatus.REJECTED_COMPANY);

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
        internship.setStatus(InternshipStatus.IN_PROGRESS);

        return internship;
    }

    @Transactional
    public Internship rejectByLecturer(Long id, Long lecturerId) {
        Internship internship = internshipRepository.findById(id);

        if (internship == null) {
            return null;
        }

        if (internship.getStatus() != InternshipStatus.PENDING_LECTURER) {
            throw new IllegalArgumentException(
                    "Internship is not waiting for lecturer approval"
            );
        }

        if (internship.getLecturerId() != null
                && !internship.getLecturerId().equals(lecturerId)) {
            throw new IllegalArgumentException(
                    "You do not have permission to reject this internship"
            );
        }

        internship.setLecturerId(lecturerId);
        internship.setStatus(InternshipStatus.REJECTED_LECTURER);

        return internship;
    }

    @Transactional
    public Internship completeByCompany(Long id, Long companyId) {
        Internship internship = internshipRepository.findById(id);

        if (internship == null) {
            return null;
        }

        if (internship.getStatus() != InternshipStatus.IN_PROGRESS) {
            throw new IllegalArgumentException(
                    "Internship is not in progress"
            );
        }

        if (internship.getCompanyId() == null
                || !internship.getCompanyId().equals(companyId)) {
            throw new IllegalArgumentException(
                    "You do not have permission to complete this internship"
            );
        }

        internship.setStatus(InternshipStatus.COMPLETED_COMPANY);

        return internship;
    }

    @Transactional
    public Internship completeByLecturer(Long id, Long lecturerId) {
        Internship internship = internshipRepository.findById(id);

        if (internship == null) {
            return null;
        }

        if (internship.getStatus() != InternshipStatus.COMPLETED_COMPANY) {
            throw new IllegalArgumentException(
                    "Internship is not completed by company yet"
            );
        }

        if (internship.getLecturerId() == null
                || !internship.getLecturerId().equals(lecturerId)) {
            throw new IllegalArgumentException(
                    "You do not have permission to complete this internship"
            );
        }

        internship.setStatus(InternshipStatus.COMPLETED_LECTURER);

        return internship;
    }

    public boolean isCompanyOwner(Long internshipId, Long companyId) {
        Internship internship = internshipRepository.findById(internshipId);

        if (internship == null) {
            return false;
        }

        return internship.getCompanyId() != null
                && internship.getCompanyId().equals(companyId);
    }

    public boolean isStudentOwner(Long internshipId, Long studentId) {
        Internship internship = internshipRepository.findById(internshipId);

        if (internship == null) {
            return false;
        }

        return internship.getStudentId() != null
                && internship.getStudentId().equals(studentId);
    }

}