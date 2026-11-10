package com.jobtrack.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(
    name = "interviews",
    indexes = {
        @Index(name = "idx_interviews_application_id", columnList = "application_id"),
        @Index(name = "idx_interviews_interview_date", columnList = "interview_date"),
        @Index(name = "idx_interviews_outcome", columnList = "outcome")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "interview_round", nullable = false, length = 100)
    private String interviewRound;

    @Column(name = "interview_date", nullable = false)
    private LocalDate interviewDate;

    @Column(name = "interview_time", nullable = false)
    private LocalTime interviewTime;

    @Column(name = "interviewer_name", length = 120)
    private String interviewerName;

    @Column(name = "interview_notes", columnDefinition = "TEXT")
    private String interviewNotes;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private InterviewOutcome outcome = InterviewOutcome.SCHEDULED;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "application_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_interviews_application")
    )
    private JobApplication application;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (this.createdAt == null) {
            this.createdAt = now;
        }
        this.updatedAt = now;
        if (this.outcome == null) {
            this.outcome = InterviewOutcome.SCHEDULED;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
