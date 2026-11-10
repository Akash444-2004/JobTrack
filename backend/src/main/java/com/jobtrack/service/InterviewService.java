package com.jobtrack.service;

import com.jobtrack.dto.request.InterviewRequest;
import com.jobtrack.dto.response.InterviewResponse;
import com.jobtrack.entity.InterviewOutcome;

import java.util.List;

public interface InterviewService {

    InterviewResponse createInterview(Long userId, Long applicationId, InterviewRequest request);

    List<InterviewResponse> getInterviewsByApplication(Long userId, Long applicationId);

    List<InterviewResponse> getAllUserInterviews(Long userId, InterviewOutcome outcome);

    InterviewResponse updateInterview(Long userId, Long interviewId, InterviewRequest request);

    void deleteInterview(Long userId, Long interviewId);
}
