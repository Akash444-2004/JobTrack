package com.jobtrack.controller;

import com.jobtrack.dto.request.InterviewRequest;
import com.jobtrack.dto.response.InterviewResponse;
import com.jobtrack.entity.InterviewOutcome;
import com.jobtrack.security.UserPrincipal;
import com.jobtrack.service.InterviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class InterviewController {

    private final InterviewService interviewService;

    @PostMapping("/applications/{id}/interviews")
    public ResponseEntity<InterviewResponse> createInterview(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") Long applicationId,
            @Valid @RequestBody InterviewRequest request
    ) {
        InterviewResponse response = interviewService.createInterview(principal.getId(), applicationId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/applications/{id}/interviews")
    public ResponseEntity<List<InterviewResponse>> getInterviewsByApplication(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable("id") Long applicationId
    ) {
        return ResponseEntity.ok(interviewService.getInterviewsByApplication(principal.getId(), applicationId));
    }

    @GetMapping("/interviews")
    public ResponseEntity<List<InterviewResponse>> getAllUserInterviews(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) InterviewOutcome outcome
    ) {
        return ResponseEntity.ok(interviewService.getAllUserInterviews(principal.getId(), outcome));
    }

    @PutMapping("/interviews/{id}")
    public ResponseEntity<InterviewResponse> updateInterview(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody InterviewRequest request
    ) {
        return ResponseEntity.ok(interviewService.updateInterview(principal.getId(), id, request));
    }

    @DeleteMapping("/interviews/{id}")
    public ResponseEntity<Void> deleteInterview(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id
    ) {
        interviewService.deleteInterview(principal.getId(), id);
        return ResponseEntity.noContent().build();
    }
}
