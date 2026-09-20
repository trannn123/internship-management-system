package cit.evaluation.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public class CompanyEvaluationRequest {

    @NotNull
//    TODO: Will check
//    @DecimalMin("0.0")
//    @DecimalMax("10.0")
    private Double score;

    private String comment;

    public CompanyEvaluationRequest() {
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }
}