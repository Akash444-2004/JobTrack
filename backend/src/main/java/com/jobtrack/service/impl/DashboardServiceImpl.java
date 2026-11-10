package com.jobtrack.service.impl;

import com.jobtrack.dto.response.DashboardRecentResponse;
import com.jobtrack.dto.response.DashboardStatsResponse;
import com.jobtrack.dto.response.InterviewResponse;
import com.jobtrack.dto.response.JobApplicationResponse;
import com.jobtrack.entity.ApplicationStatus;
import com.jobtrack.entity.InterviewOutcome;
import com.jobtrack.entity.JobApplication;
import com.jobtrack.mapper.ApplicationMapper;
import com.jobtrack.repository.InterviewRepository;
import com.jobtrack.repository.JobApplicationRepository;
import com.jobtrack.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private static final List<InterviewOutcome> UPCOMING_OUTCOMES = List.of(
            InterviewOutcome.SCHEDULED,
            InterviewOutcome.RESCHEDULED
    );

    private static final DateTimeFormatter MONTH_KEY_FMT = DateTimeFormatter.ofPattern("yyyy-MM");
    private static final DateTimeFormatter MONTH_LABEL_FMT = DateTimeFormatter.ofPattern("MMM yyyy", Locale.ENGLISH);

    private final JobApplicationRepository jobApplicationRepository;
    private final InterviewRepository interviewRepository;
    private final ApplicationMapper applicationMapper;

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getStats(Long userId) {
        Map<ApplicationStatus, Long> counts = new EnumMap<>(ApplicationStatus.class);
        for (ApplicationStatus status : ApplicationStatus.values()) {
            counts.put(status, 0L);
        }

        for (Object[] row : jobApplicationRepository.countApplicationsGroupedByStatus(userId)) {
            ApplicationStatus status = (ApplicationStatus) row[0];
            Long count = (Long) row[1];
            counts.put(status, count);
        }

        long applied = counts.get(ApplicationStatus.APPLIED);
        long assessments = counts.get(ApplicationStatus.ASSESSMENT);
        long interviews = counts.get(ApplicationStatus.INTERVIEW);
        long selected = counts.get(ApplicationStatus.SELECTED);
        long rejected = counts.get(ApplicationStatus.REJECTED);
        long total = applied + assessments + interviews + selected + rejected;

        long upcomingInterviewsCount = interviewRepository
                .countByApplicationUserIdAndInterviewDateGreaterThanEqualAndOutcomeIn(
                        userId, LocalDate.now(), UPCOMING_OUTCOMES);

        long progressed = assessments + interviews + selected + rejected;
        double responseRate = total > 0
                ? Math.round((progressed * 1000.0) / total) / 10.0
                : 0.0;

        List<DashboardStatsResponse.StatusDistributionItem> distribution = List.of(
                new DashboardStatsResponse.StatusDistributionItem(ApplicationStatus.APPLIED, "Applied", applied),
                new DashboardStatsResponse.StatusDistributionItem(ApplicationStatus.ASSESSMENT, "Assessments", assessments),
                new DashboardStatsResponse.StatusDistributionItem(ApplicationStatus.INTERVIEW, "Interviews", interviews),
                new DashboardStatsResponse.StatusDistributionItem(ApplicationStatus.SELECTED, "Selected", selected),
                new DashboardStatsResponse.StatusDistributionItem(ApplicationStatus.REJECTED, "Rejected", rejected)
        );

        List<DashboardStatsResponse.MonthlyActivityItem> monthlyActivity = buildMonthlyActivity(userId);

        return DashboardStatsResponse.builder()
                .totalApplications(total)
                .applied(applied)
                .assessments(assessments)
                .interviews(interviews)
                .selected(selected)
                .rejected(rejected)
                .upcomingInterviewsCount(upcomingInterviewsCount)
                .responseRate(responseRate)
                .statusDistribution(distribution)
                .monthlyActivity(monthlyActivity)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardRecentResponse getRecent(Long userId) {
        List<JobApplicationResponse> recentApplications = jobApplicationRepository
                .findTop5ByUserIdOrderByApplicationDateDescCreatedAtDesc(userId)
                .stream()
                .map(applicationMapper::toSummaryResponse)
                .toList();

        List<InterviewResponse> upcomingInterviews = interviewRepository
                .findUpcomingInterviews(
                        userId,
                        LocalDate.now(),
                        UPCOMING_OUTCOMES,
                        PageRequest.of(0, 5)
                )
                .stream()
                .map(applicationMapper::toInterviewResponse)
                .toList();

        return DashboardRecentResponse.builder()
                .recentApplications(recentApplications)
                .upcomingInterviews(upcomingInterviews)
                .build();
    }

    private List<DashboardStatsResponse.MonthlyActivityItem> buildMonthlyActivity(Long userId) {
        YearMonth currentMonth = YearMonth.now();
        YearMonth startMonth = currentMonth.minusMonths(5);
        LocalDate fromDate = startMonth.atDay(1);

        Map<YearMonth, Long> monthCounts = new LinkedHashMap<>();
        for (int i = 0; i < 6; i++) {
            monthCounts.put(startMonth.plusMonths(i), 0L);
        }

        List<JobApplication> apps = jobApplicationRepository
                .findByUserIdAndApplicationDateGreaterThanEqualOrderByApplicationDateAsc(userId, fromDate);

        for (JobApplication app : apps) {
            if (app.getApplicationDate() != null) {
                YearMonth ym = YearMonth.from(app.getApplicationDate());
                if (monthCounts.containsKey(ym)) {
                    monthCounts.computeIfPresent(ym, (k, v) -> v + 1);
                }
            }
        }

        return monthCounts.entrySet().stream()
                .map(entry -> DashboardStatsResponse.MonthlyActivityItem.builder()
                        .month(entry.getKey().format(MONTH_KEY_FMT))
                        .label(entry.getKey().format(MONTH_LABEL_FMT))
                        .count(entry.getValue())
                        .build())
                .toList();
    }
}
