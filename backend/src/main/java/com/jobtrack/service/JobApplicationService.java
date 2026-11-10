package com.jobtrack.service;

import com.jobtrack.dto.request.JobApplicationRequest;
import com.jobtrack.dto.request.StatusUpdateRequest;
import com.jobtrack.dto.response.JobApplicationResponse;
import com.jobtrack.dto.response.PagedResponse;
import com.jobtrack.entity.ApplicationStatus;
import com.jobtrack.entity.JobType;
import com.jobtrack.entity.WorkMode;

import java.time.LocalDate;

public interface JobApplicationService {

    JobApplicationResponse createApplication(Long userId, JobApplicationRequest request);

    PagedResponse<JobApplicationResponse> getApplications(
            Long userId,
            String keyword,
            ApplicationStatus status,
            JobType jobType,
            WorkMode workMode,
            LocalDate fromDate,
            LocalDate toDate,
            int page,
            int size,
            String sortBy,
            String sortDir
    );

    JobApplicationResponse getApplicationById(Long userId, Long applicationId);

    JobApplicationResponse updateApplication(Long userId, Long applicationId, JobApplicationRequest request);

    JobApplicationResponse updateApplicationStatus(Long userId, Long applicationId, StatusUpdateRequest request);

    void deleteApplication(Long userId, Long applicationId);
}
