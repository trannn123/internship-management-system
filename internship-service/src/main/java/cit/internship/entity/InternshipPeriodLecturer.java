package cit.internship.entity;

import jakarta.persistence.*;

@Entity
@Table(
        name = "internship_period_lecturers",
        uniqueConstraints = @UniqueConstraint(columnNames = {"period_id", "lecturer_id"})
)
public class InternshipPeriodLecturer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "period_id", nullable = false)
    private Long periodId;

    @Column(name = "lecturer_id", nullable = false)
    private Long lecturerId;

    public InternshipPeriodLecturer() {
    }

    public Long getId() {
        return id;
    }

    public Long getPeriodId() {
        return periodId;
    }

    public void setPeriodId(Long periodId) {
        this.periodId = periodId;
    }

    public Long getLecturerId() {
        return lecturerId;
    }

    public void setLecturerId(Long lecturerId) {
        this.lecturerId = lecturerId;
    }
}
