package cit.internship.service;

import cit.internship.dto.InternshipLogRequest;
import cit.internship.entity.InternshipLog;
import cit.internship.repository.InternshipLogRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import cit.internship.entity.Internship;
import cit.internship.entity.InternshipStatus;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import java.util.List;

@ApplicationScoped
public class InternshipLogService {

    @Inject
    InternshipLogRepository internshipLogRepository;

    @Inject
    InternshipService internshipService;

    public InternshipLog getLogById(Long id) {
        return internshipLogRepository.findById(id);
    }

    public List<InternshipLog> getLogsByInternshipId(Long internshipId) {
        return internshipLogRepository.findByInternshipId(internshipId);
    }

    @Transactional
    public InternshipLog createLog(Long internshipId, InternshipLogRequest request) {
        Internship internship = internshipService.getInternshipById(internshipId);

        if (internship == null) {
            throw new NotFoundException("Internship not found");
        }

        // Chỉ cho phép tạo nhật ký khi thực tập đang diễn ra
        if (internship.getStatus() != InternshipStatus.IN_PROGRESS) {
            throw new BadRequestException(
                    "Internship logs can only be created when the internship is IN_PROGRESS"
            );
        }

        InternshipLog log = new InternshipLog();

        log.setInternshipId(internshipId);
        log.setLogDate(request.getLogDate());
        log.setContent(request.getContent());
        log.setResult(request.getResult());
        log.setNote(request.getNote());

        internshipLogRepository.persist(log);

        return log;
    }
}