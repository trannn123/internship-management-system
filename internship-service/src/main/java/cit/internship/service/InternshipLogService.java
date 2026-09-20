package cit.internship.service;

import cit.internship.dto.InternshipLogRequest;
import cit.internship.entity.InternshipLog;
import cit.internship.repository.InternshipLogRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.util.List;

@ApplicationScoped
public class InternshipLogService {

    @Inject
    InternshipLogRepository internshipLogRepository;

    public InternshipLog getLogById(Long id) {
        return internshipLogRepository.findById(id);
    }

    public List<InternshipLog> getLogsByInternshipId(Long internshipId) {
        return internshipLogRepository.findByInternshipId(internshipId);
    }

    @Transactional
    public InternshipLog createLog(Long internshipId, InternshipLogRequest request) {
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