package cit.evaluation.dto;

public class EvaluationSummaryResponse {

    private Long internshipId;

    private Double companyScore;

    private Double lecturerScore;

    private Double finalScore;

    private String companyComment;

    private String lecturerComment;

    public EvaluationSummaryResponse() {
    }

    public Long getInternshipId() {
        return internshipId;
    }

    public void setInternshipId(Long internshipId) {
        this.internshipId = internshipId;
    }

    public Double getCompanyScore() {
        return companyScore;
    }

    public void setCompanyScore(Double companyScore) {
        this.companyScore = companyScore;
    }

    public Double getLecturerScore() {
        return lecturerScore;
    }

    public void setLecturerScore(Double lecturerScore) {
        this.lecturerScore = lecturerScore;
    }

    public Double getFinalScore() {
        return finalScore;
    }

    public void setFinalScore(Double finalScore) {
        this.finalScore = finalScore;
    }

    public String getCompanyComment() {
        return companyComment;
    }

    public void setCompanyComment(String companyComment) {
        this.companyComment = companyComment;
    }

    public String getLecturerComment() {
        return lecturerComment;
    }

    public void setLecturerComment(String lecturerComment) {
        this.lecturerComment = lecturerComment;
    }
}