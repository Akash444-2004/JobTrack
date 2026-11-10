package com.jobtrack.controller;

import com.jobtrack.dto.request.JobApplicationRequest;
import com.jobtrack.dto.request.StatusUpdateRequest;
import com.jobtrack.dto.response.JobApplicationResponse;
import com.jobtrack.dto.response.PagedResponse;
import com.jobtrack.entity.ApplicationStatus;
import com.jobtrack.entity.JobType;
import com.jobtrack.entity.WorkMode;
import com.jobtrack.security.UserPrincipal;
import com.jobtrack.service.JobApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;

    @PostMapping
    public ResponseEntity<JobApplicationResponse> createApplication(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody JobApplicationRequest request
    ) {
        JobApplicationResponse response = jobApplicationService.createApplication(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<PagedResponse<JobApplicationResponse>> getApplications(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) JobType jobType,
            @RequestParam(required = false) WorkMode workMode,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "applicationDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        return ResponseEntity.ok(jobApplicationService.getApplications(
                principal.getId(),
                keyword,
                status,
                jobType,
                workMode,
                fromDate,
                toDate,
                page,
                size,
                sortBy,
                sortDir
        ));
    }

    @GetMapping("/search")
    public ResponseEntity<PagedResponse<JobApplicationResponse>> searchApplications(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false, name = "q") String query,
            @RequestParam(required = false) ApplicationStatus status,
            @RequestParam(required = false) JobType jobType,
            @RequestParam(required = false) WorkMode workMode,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "applicationDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        String effectiveKeyword = (keyword != null && !keyword.isBlank()) ? keyword : query;
        return ResponseEntity.ok(jobApplicationService.getApplications(
                principal.getId(),
                effectiveKeyword,
                status,
                jobType,
                workMode,
                fromDate,
                toDate,
                page,
                size,
                sortBy,
                sortDir
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobApplicationResponse> getApplicationById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(jobApplicationService.getApplicationById(principal.getId(), id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobApplicationResponse> updateApplication(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody JobApplicationRequest request
    ) {
        return ResponseEntity.ok(jobApplicationService.updateApplication(principal.getId(), id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<JobApplicationResponse> updateApplicationStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody StatusUpdateRequest request
    ) {
        return ResponseEntity.ok(jobApplicationService.updateApplicationStatus(principal.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        jobApplicationService.deleteApplication(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
