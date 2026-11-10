package com.jobtrack.service;

import com.jobtrack.dto.response.DashboardStatsResponse;
import com.jobtrack.entity.ApplicationStatus;
import com.jobtrack.entity.JobApplication;
import com.jobtrack.mapper.ApplicationMapper;
import com.jobtrack.repository.InterviewRepository;
import com.jobtrack.repository.JobApplicationRepository;
import com.jobtrack.service.impl.DashboardServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceImplTest {

    @Mock
    private JobApplicationRepository jobApplicationRepository;
    @Mock
    private InterviewRepository interviewRepository;
    @Mock
    private ApplicationMapper applicationMapper;

    @InjectMocks
    private DashboardServiceImpl dashboardService;

    @Test
    void getStats_ShouldAggregateCountsDistributionAndMonthlyActivity() {
        List<Object[]> grouped = List.of(
                new Object[]{ApplicationStatus.APPLIED, 2L},
                new Object[]{ApplicationStatus.ASSESSMENT, 1L},
                new Object[]{ApplicationStatus.INTERVIEW, 1L},
                new Object[]{ApplicationStatus.SELECTED, 1L}
        );

        when(jobApplicationRepository.countApplicationsGroupedByStatus(1L)).thenReturn(grouped);
        when(interviewRepository.countByApplicationUserIdAndInterviewDateGreaterThanEqualAndOutcomeIn(
                eq(1L), any(LocalDate.class), any())).thenReturn(2L);
        when(jobApplicationRepository.findByUserIdAndApplicationDateGreaterThanEqualOrderByApplicationDateAsc(
                eq(1L), any(LocalDate.class)))
                .thenReturn(List.of(
                        JobApplication.builder().applicationDate(LocalDate.now()).build(),
                        JobApplication.builder().applicationDate(LocalDate.now().minusMonths(1)).build()
                ));

        DashboardStatsResponse stats = dashboardService.getStats(1L);

        assertThat(stats.getTotalApplications()).isEqualTo(5L);
        assertThat(stats.getApplied()).isEqualTo(2L);
        assertThat(stats.getAssessments()).isEqualTo(1L);
        assertThat(stats.getInterviews()).isEqualTo(1L);
        assertThat(stats.getSelected()).isEqualTo(1L);
        assertThat(stats.getRejected()).isEqualTo(0L);
        assertThat(stats.getUpcomingInterviewsCount()).isEqualTo(2L);
        assertThat(stats.getResponseRate()).isEqualTo(60.0);
        assertThat(stats.getStatusDistribution()).hasSize(5);
        assertThat(stats.getMonthlyActivity()).hasSize(6);
    }
}
