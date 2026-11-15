package com.jobtrack.mapper;

import com.jobtrack.dto.request.InterviewRequest;
import com.jobtrack.dto.request.JobApplicationRequest;
import com.jobtrack.dto.response.InterviewResponse;
import com.jobtrack.dto.response.JobApplicationResponse;
import com.jobtrack.dto.response.StatusHistoryResponse;
import com.jobtrack.dto.response.UserProfileResponse;
import com.jobtrack.entity.*;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class ApplicationMapper {

    public UserProfileResponse toUserProfileResponse(User user, long totalApplications, long totalInterviews) {
        return toUserProfileResponse(user, totalApplications, totalInterviews, null);
    }

    public UserProfileResponse toUserProfileResponse(
            User user,
            long totalApplications,
            long totalInterviews,
            String accessToken
    ) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .totalApplications(totalApplications)
                .totalInterviews(totalInterviews)
                .accessToken(accessToken)
                .build();
    }

    public JobApplication toEntity(JobApplicationRequest request, User user) {
        return JobApplication.builder()
                .companyName(trimToNull(request.getCompanyName()))
                .jobTitle(trimToNull(request.getJobTitle()))
                .jobDescription(trimToNull(request.getJobDescription()))
                .location(trimToNull(request.getLocation()))
                .jobType(request.getJobType() != null ? request.getJobType() : JobType.FULL_TIME)
                .workMode(request.getWorkMode() != null ? request.getWorkMode() : WorkMode.ONSITE)
                .salary(trimToNull(request.getSalary()))
                .applicationDate(request.getApplicationDate())
                .status(request.getStatus() != null ? request.getStatus() : ApplicationStatus.APPLIED)
                .jobUrl(trimToNull(request.getJobUrl()))
                .recruiterName(trimToNull(request.getRecruiterName()))
                .recruiterEmail(trimToNull(request.getRecruiterEmail()))
                .notes(trimToNull(request.getNotes()))
                .user(user)
                .build();
    }

    public void updateEntity(JobApplication application, JobApplicationRequest request) {
        application.setCompanyName(trimToNull(request.getCompanyName()));
        application.setJobTitle(trimToNull(request.getJobTitle()));
        application.setJobDescription(trimToNull(request.getJobDescription()));
        application.setLocation(trimToNull(request.getLocation()));
        application.setJobType(request.getJobType() != null ? request.getJobType() : application.getJobType());
        application.setWorkMode(request.getWorkMode() != null ? request.getWorkMode() : application.getWorkMode());
        application.setSalary(trimToNull(request.getSalary()));
        application.setApplicationDate(request.getApplicationDate());
        application.setStatus(request.getStatus());
        application.setJobUrl(trimToNull(request.getJobUrl()));
        application.setRecruiterName(trimToNull(request.getRecruiterName()));
        application.setRecruiterEmail(trimToNull(request.getRecruiterEmail()));
        application.setNotes(trimToNull(request.getNotes()));
    }

    public JobApplicationResponse toSummaryResponse(JobApplication application) {
        int interviewCount = application.getInterviews() != null ? application.getInterviews().size() : 0;
        return JobApplicationResponse.builder()
                .id(application.getId())
                .companyName(application.getCompanyName())
                .jobTitle(application.getJobTitle())
                .jobDescription(application.getJobDescription())
                .location(application.getLocation())
                .jobType(application.getJobType())
                .workMode(application.getWorkMode())
                .salary(application.getSalary())
                .applicationDate(application.getApplicationDate())
                .status(application.getStatus())
                .jobUrl(application.getJobUrl())
                .recruiterName(application.getRecruiterName())
                .recruiterEmail(application.getRecruiterEmail())
                .notes(application.getNotes())
                .userId(application.getUser().getId())
                .createdAt(application.getCreatedAt())
                .updatedAt(application.getUpdatedAt())
                .interviewCount(interviewCount)
                .statusHistory(Collections.emptyList())
                .interviews(Collections.emptyList())
                .build();
    }

    public JobApplicationResponse toDetailedResponse(
            JobApplication application,
            List<ApplicationStatusHistory> history,
            List<Interview> interviews
    ) {
        List<StatusHistoryResponse> historyResponses = history == null
                ? Collections.emptyList()
                : history.stream().map(this::toStatusHistoryResponse).toList();

        List<InterviewResponse> interviewResponses = interviews == null
                ? Collections.emptyList()
                : interviews.stream().map(this::toInterviewResponse).toList();

        return JobApplicationResponse.builder()
                .id(application.getId())
                .companyName(application.getCompanyName())
                .jobTitle(application.getJobTitle())
                .jobDescription(application.getJobDescription())
                .location(application.getLocation())
                .jobType(application.getJobType())
                .workMode(application.getWorkMode())
                .salary(application.getSalary())
                .applicationDate(application.getApplicationDate())
                .status(application.getStatus())
                .jobUrl(application.getJobUrl())
                .recruiterName(application.getRecruiterName())
                .recruiterEmail(application.getRecruiterEmail())
                .notes(application.getNotes())
                .userId(application.getUser().getId())
                .createdAt(application.getCreatedAt())
                .updatedAt(application.getUpdatedAt())
                .interviewCount(interviewResponses.size())
                .statusHistory(historyResponses)
                .interviews(interviewResponses)
                .build();
    }

    public StatusHistoryResponse toStatusHistoryResponse(ApplicationStatusHistory history) {
        return StatusHistoryResponse.builder()
                .id(history.getId())
                .previousStatus(history.getPreviousStatus())
                .newStatus(history.getNewStatus())
                .changedAt(history.getChangedAt())
                .build();
    }

    public Interview toInterviewEntity(InterviewRequest request, JobApplication application) {
        return Interview.builder()
                .interviewRound(trimToNull(request.getInterviewRound()))
                .interviewDate(request.getInterviewDate())
                .interviewTime(request.getInterviewTime())
                .interviewerName(trimToNull(request.getInterviewerName()))
                .interviewNotes(trimToNull(request.getInterviewNotes()))
                .outcome(request.getOutcome() != null ? request.getOutcome() : InterviewOutcome.SCHEDULED)
                .application(application)
                .build();
    }

    public void updateInterviewEntity(Interview interview, InterviewRequest request) {
        interview.setInterviewRound(trimToNull(request.getInterviewRound()));
        interview.setInterviewDate(request.getInterviewDate());
        interview.setInterviewTime(request.getInterviewTime());
        interview.setInterviewerName(trimToNull(request.getInterviewerName()));
        interview.setInterviewNotes(trimToNull(request.getInterviewNotes()));
        if (request.getOutcome() != null) {
            interview.setOutcome(request.getOutcome());
        }
    }

    public InterviewResponse toInterviewResponse(Interview interview) {
        JobApplication application = interview.getApplication();
        return InterviewResponse.builder()
                .id(interview.getId())
                .interviewRound(interview.getInterviewRound())
                .interviewDate(interview.getInterviewDate())
                .interviewTime(interview.getInterviewTime())
                .interviewerName(interview.getInterviewerName())
                .interviewNotes(interview.getInterviewNotes())
                .outcome(interview.getOutcome())
                .applicationId(application != null ? application.getId() : null)
                .companyName(application != null ? application.getCompanyName() : null)
                .jobTitle(application != null ? application.getJobTitle() : null)
                .createdAt(interview.getCreatedAt())
                .updatedAt(interview.getUpdatedAt())
                .build();
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
