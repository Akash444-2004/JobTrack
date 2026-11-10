package com.jobtrack.dto.response;

import com.jobtrack.entity.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private long totalApplications;
    private long applied;
    private long assessments;
    private long interviews;
    private long selected;
    private long rejected;
    private long upcomingInterviewsCount;
    private double responseRate;
    private List<StatusDistributionItem> statusDistribution;
    private List<MonthlyActivityItem> monthlyActivity;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusDistributionItem {
        private ApplicationStatus status;
        private String label;
        private long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyActivityItem {
        private String month;
        private String label;
        private long count;
    }
}
