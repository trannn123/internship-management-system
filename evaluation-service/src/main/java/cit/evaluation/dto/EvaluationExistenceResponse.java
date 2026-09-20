package cit.evaluation.dto;

public class EvaluationExistenceResponse {

    private Long internshipId;

    private boolean companyEvaluationExists;

    private boolean lecturerEvaluationExists;

    public EvaluationExistenceResponse() {
    }

    public Long getInternshipId() {
        return internshipId;
    }

    public void setInternshipId(Long internshipId) {
        this.internshipId = internshipId;
    }

    public boolean isCompanyEvaluationExists() {
        return companyEvaluationExists;
    }

    public void setCompanyEvaluationExists(boolean companyEvaluationExists) {
        this.companyEvaluationExists = companyEvaluationExists;
    }

    public boolean isLecturerEvaluationExists() {
        return lecturerEvaluationExists;
    }

    public void setLecturerEvaluationExists(boolean lecturerEvaluationExists) {
        this.lecturerEvaluationExists = lecturerEvaluationExists;
    }
}
