package com.jobtrack.controller;

import com.jobtrack.dto.response.DashboardRecentResponse;
import com.jobtrack.dto.response.DashboardStatsResponse;
import com.jobtrack.security.UserPrincipal;
import com.jobtrack.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getStats(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(dashboardService.getStats(principal.getId()));
    }

    @GetMapping("/recent")
    public ResponseEntity<DashboardRecentResponse> getRecent(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        return ResponseEntity.ok(dashboardService.getRecent(principal.getId()));
    }
}
