package com.jobtrack.dto.response;

import com.jobtrack.entity.InterviewOutcome;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewResponse {
    private Long id;
    private String interviewRound;
    private LocalDate interviewDate;
    private LocalTime interviewTime;
    private String interviewerName;
    private String interviewNotes;
    private InterviewOutcome outcome;
    private Long applicationId;
    private String companyName;
    private String jobTitle;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
