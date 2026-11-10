package com.jobtrack.dto.request;

import com.jobtrack.entity.InterviewOutcome;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewRequest {

    @NotBlank(message = "Interview round is required")
    @Size(max = 100, message = "Interview round cannot exceed 100 characters")
    private String interviewRound;

    @NotNull(message = "Interview date is required")
    private LocalDate interviewDate;

    @NotNull(message = "Interview time is required")
    private LocalTime interviewTime;

    @Size(max = 120, message = "Interviewer name cannot exceed 120 characters")
    private String interviewerName;

    @Size(max = 5000, message = "Interview notes cannot exceed 5000 characters")
    private String interviewNotes;

    private InterviewOutcome outcome;
}
