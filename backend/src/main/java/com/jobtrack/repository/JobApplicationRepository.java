package com.jobtrack.repository;

import com.jobtrack.entity.ApplicationStatus;
import com.jobtrack.entity.JobApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long>, JpaSpecificationExecutor<JobApplication> {

    Optional<JobApplication> findByIdAndUserId(Long id, Long userId);

    Page<JobApplication> findByUserId(Long userId, Pageable pageable);

    long countByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, ApplicationStatus status);

    List<JobApplication> findTop5ByUserIdOrderByApplicationDateDescCreatedAtDesc(Long userId);

    List<JobApplication> findByUserIdAndApplicationDateGreaterThanEqualOrderByApplicationDateAsc(
            Long userId, LocalDate fromDate);

    @Query("SELECT j.status, COUNT(j) FROM JobApplication j WHERE j.user.id = :userId GROUP BY j.status")
    List<Object[]> countApplicationsGroupedByStatus(@Param("userId") Long userId);
}
