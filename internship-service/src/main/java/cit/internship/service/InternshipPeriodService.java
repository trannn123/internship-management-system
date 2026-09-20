package cit.internship.service;

import cit.internship.dto.AssignLecturerRequest;
import cit.internship.dto.InternshipPeriodRequest;
import cit.internship.dto.InternshipPeriodResponse;
import cit.internship.entity.InternshipPeriod;
import cit.internship.entity.InternshipPeriodLecturer;
import cit.internship.entity.InternshipPeriodStatus;
import cit.internship.repository.InternshipPeriodLecturerRepository;
import cit.internship.repository.InternshipPeriodRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;

import java.time.LocalDate;
import java.util.List;

@ApplicationScoped
public class InternshipPeriodService {

    @Inject
    InternshipPeriodRepository internshipPeriodRepository;

    @Inject
    InternshipPeriodLecturerRepository internshipPeriodLecturerRepository;

    public List<InternshipPeriodResponse> getAllPeriods() {
        return internshipPeriodRepository.listAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public InternshipPeriodResponse getPeriodById(Long id) {
        return toResponse(requirePeriod(id));
    }

    public InternshipPeriod getPeriodEntityById(Long id) {
        return requirePeriod(id);
    }

    @Transactional
    public InternshipPeriodResponse createPeriod(InternshipPeriodRequest request) {
        validatePeriodDates(request);

        InternshipPeriod period = new InternshipPeriod();
        apply(period, request);
        internshipPeriodRepository.persist(period);

        return toResponse(period);
    }

    @Transactional
    public InternshipPeriodResponse updatePeriod(Long id, InternshipPeriodRequest request) {
        validatePeriodDates(request);

        InternshipPeriod period = requirePeriod(id);
        apply(period, request);

        return toResponse(period);
    }

    @Transactional
    public void deletePeriod(Long id) {
        InternshipPeriod period = requirePeriod(id);
        internshipPeriodRepository.delete(period);
    }

    @Transactional
    public InternshipPeriodLecturer assignLecturer(Long periodId, AssignLecturerRequest request) {
        requirePeriod(periodId);

        if (internshipPeriodLecturerRepository.findByPeriodIdAndLecturerId(periodId, request.getLecturerId()) != null) {
            throw new BadRequestException("Lecturer is already assigned to this period");
        }

        InternshipPeriodLecturer assignment = new InternshipPeriodLecturer();
        assignment.setPeriodId(periodId);
        assignment.setLecturerId(request.getLecturerId());
        internshipPeriodLecturerRepository.persist(assignment);

        return assignment;
    }

    public List<InternshipPeriodLecturer> getAssignedLecturers(Long periodId) {
        requirePeriod(periodId);
        return internshipPeriodLecturerRepository.findByPeriodId(periodId);
    }

    @Transactional
    public void removeAssignedLecturer(Long periodId, Long lecturerId) {
        InternshipPeriodLecturer assignment = internshipPeriodLecturerRepository.findByPeriodIdAndLecturerId(periodId, lecturerId);

        if (assignment == null) {
            throw new NotFoundException("Lecturer assignment not found");
        }

        internshipPeriodLecturerRepository.delete(assignment);
    }

    public boolean isRegistrationWindowOpen(InternshipPeriod period) {
        if (period.getStatus() != InternshipPeriodStatus.OPEN) {
            return false;
        }

        LocalDate today = LocalDate.now();

        if (period.getRegistrationStartDate() != null && today.isBefore(period.getRegistrationStartDate())) {
            return false;
        }

        if (period.getRegistrationEndDate() != null && today.isAfter(period.getRegistrationEndDate())) {
            return false;
        }

        return true;
    }

    public InternshipPeriod requireOpenPeriodForOpportunity(Long periodId) {
        InternshipPeriod period = requirePeriod(periodId);

        if (period.getStatus() != InternshipPeriodStatus.OPEN) {
            throw new BadRequestException("Only OPEN internship periods can accept opportunities");
        }

        return period;
    }

    private InternshipPeriod requirePeriod(Long id) {
        InternshipPeriod period = internshipPeriodRepository.findById(id);

        if (period == null) {
            throw new NotFoundException("Internship period not found");
        }

        return period;
    }

    private void apply(InternshipPeriod period, InternshipPeriodRequest request) {
        period.setName(request.getName());
        period.setDescription(request.getDescription());
        period.setRegistrationStartDate(request.getRegistrationStartDate());
        period.setRegistrationEndDate(request.getRegistrationEndDate());
        period.setInternshipStartDate(request.getInternshipStartDate());
        period.setInternshipEndDate(request.getInternshipEndDate());
        period.setStatus(request.getStatus() != null ? request.getStatus() : InternshipPeriodStatus.DRAFT);
    }

    private void validatePeriodDates(InternshipPeriodRequest request) {
        if (request.getRegistrationStartDate() != null
                && request.getRegistrationEndDate() != null
                && request.getRegistrationStartDate().isAfter(request.getRegistrationEndDate())) {
            throw new BadRequestException("Registration start date must be on or before registration end date");
        }

        if (request.getInternshipStartDate() != null
                && request.getInternshipEndDate() != null
                && request.getInternshipStartDate().isAfter(request.getInternshipEndDate())) {
            throw new BadRequestException("Internship start date must be on or before internship end date");
        }
    }

    private InternshipPeriodResponse toResponse(InternshipPeriod period) {
        InternshipPeriodResponse response = new InternshipPeriodResponse();
        response.setId(period.getId());
        response.setName(period.getName());
        response.setDescription(period.getDescription());
        response.setRegistrationStartDate(period.getRegistrationStartDate());
        response.setRegistrationEndDate(period.getRegistrationEndDate());
        response.setInternshipStartDate(period.getInternshipStartDate());
        response.setInternshipEndDate(period.getInternshipEndDate());
        response.setStatus(period.getStatus());
        response.setCreatedAt(period.getCreatedAt());
        response.setUpdatedAt(period.getUpdatedAt());
        return response;
    }
}
