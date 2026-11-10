package com.jobtrack.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "job_applications",
    indexes = {
        @Index(name = "idx_job_applications_user_id", columnList = "user_id"),
        @Index(name = "idx_job_applications_status", columnList = "status"),
        @Index(name = "idx_job_applications_application_date", columnList = "application_date"),
        @Index(name = "idx_job_applications_user_status", columnList = "user_id, status"),
        @Index(name = "idx_job_applications_company_name", columnList = "company_name")
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_name", nullable = false, length = 150)
    private String companyName;

    @Column(name = "job_title", nullable = false, length = 150)
    private String jobTitle;

    @Column(name = "job_description", columnDefinition = "TEXT")
    private String jobDescription;

    @Column(length = 150)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "job_type", nullable = false, length = 30)
    @Builder.Default
    private JobType jobType = JobType.FULL_TIME;

    @Enumerated(EnumType.STRING)
    @Column(name = "work_mode", nullable = false, length = 30)
    @Builder.Default
    private WorkMode workMode = WorkMode.ONSITE;

    @Column(length = 100)
    private String salary;

    @Column(name = "application_date", nullable = false)
    private LocalDate applicationDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.APPLIED;

    @Column(name = "job_url", length = 500)
    private String jobUrl;

    @Column(name = "recruiter_name", length = 120)
    private String recruiterName;

    @Column(name = "recruiter_email", length = 150)
    private String recruiterEmail;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "user_id",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_job_applications_user")
    )
    private User user;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("changedAt DESC")
    @Builder.Default
    private List<ApplicationStatusHistory> statusHistory = new ArrayList<>();

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("interviewDate ASC, interviewTime ASC")
    @Builder.Default
    private List<Interview> interviews = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        if (this.createdAt == null) {
            this.createdAt = now;
        }
        this.updatedAt = now;
        if (this.applicationDate == null) {
            this.applicationDate = LocalDate.now();
        }
        if (this.status == null) {
            this.status = ApplicationStatus.APPLIED;
        }
        if (this.jobType == null) {
            this.jobType = JobType.FULL_TIME;
        }
        if (this.workMode == null) {
            this.workMode = WorkMode.ONSITE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
