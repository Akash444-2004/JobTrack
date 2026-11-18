package com.jobtrack.repository;

import com.jobtrack.entity.Interview;
import com.jobtrack.entity.InterviewOutcome;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface InterviewRepository extends JpaRepository<Interview, Long> {

    Optional<Interview> findByIdAndApplicationUserId(Long id, Long userId);

    List<Interview> findByApplicationIdOrderByInterviewDateAscInterviewTimeAsc(Long applicationId);

    @Query("SELECT i FROM Interview i JOIN FETCH i.application a WHERE a.user.id = :userId " +
           "ORDER BY i.interviewDate ASC, i.interviewTime ASC")
    List<Interview> findAllByUserIdWithApplication(@Param("userId") Long userId);

    @Query("SELECT i FROM Interview i JOIN FETCH i.application a WHERE a.user.id = :userId " +
           "AND i.outcome = :outcome ORDER BY i.interviewDate ASC, i.interviewTime ASC")
    List<Interview> findByUserIdAndOutcomeWithApplication(
            @Param("userId") Long userId,
            @Param("outcome") InterviewOutcome outcome);

    @Query("SELECT i FROM Interview i JOIN FETCH i.application a WHERE a.user.id = :userId " +
           "AND i.interviewDate >= :today AND i.outcome IN :outcomes " +
           "ORDER BY i.interviewDate ASC, i.interviewTime ASC")
    List<Interview> findUpcomingInterviews(
            @Param("userId") Long userId,
            @Param("today") LocalDate today,
            @Param("outcomes") List<InterviewOutcome> outcomes,
            Pageable pageable);

    long countByApplicationUserId(Long userId);

    long countByApplicationUserIdAndInterviewDateGreaterThanEqualAndOutcomeIn(
            Long userId, LocalDate today, List<InterviewOutcome> outcomes);

    @Query("SELECT i.application.id, COUNT(i) FROM Interview i WHERE i.application.id IN :applicationIds GROUP BY i.application.id")
    List<Object[]> countInterviewsGroupedByApplicationIds(@Param("applicationIds") List<Long> applicationIds);
}
