package com.jobtrack.service;

import com.jobtrack.dto.response.DashboardRecentResponse;
import com.jobtrack.dto.response.DashboardStatsResponse;

public interface DashboardService {
    DashboardStatsResponse getStats(Long userId);
    DashboardRecentResponse getRecent(Long userId);
}
