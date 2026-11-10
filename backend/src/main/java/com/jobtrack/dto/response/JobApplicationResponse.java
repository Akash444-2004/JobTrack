package com.jobtrack.dto.response;

import com.jobtrack.entity.ApplicationStatus;
import com.jobtrack.entity.JobType;
import com.jobtrack.entity.WorkMode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobApplicationResponse {
    private Long id;
    private String companyName;
    private String jobTitle;
    private String jobDescription;
    private String location;
    private JobType jobType;
    private WorkMode workMode;
    private String salary;
    private LocalDate applicationDate;
    private ApplicationStatus status;
    private String jobUrl;
    private String recruiterName;
    private String recruiterEmail;
    private String notes;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int interviewCount;
    private List<StatusHistoryResponse> statusHistory;
    private List<InterviewResponse> interviews;
}
