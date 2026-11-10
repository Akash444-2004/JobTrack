package com.jobtrack.dto.request;

import com.jobtrack.entity.ApplicationStatus;
import com.jobtrack.entity.JobType;
import com.jobtrack.entity.WorkMode;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobApplicationRequest {

    @NotBlank(message = "Company name is required")
    @Size(max = 150, message = "Company name cannot exceed 150 characters")
    private String companyName;

    @NotBlank(message = "Job title is required")
    @Size(max = 150, message = "Job title cannot exceed 150 characters")
    private String jobTitle;

    @Size(max = 10000, message = "Job description is too long")
    private String jobDescription;

    @Size(max = 150, message = "Location cannot exceed 150 characters")
    private String location;

    @NotNull(message = "Job type is required")
    private JobType jobType;

    @NotNull(message = "Work mode is required")
    private WorkMode workMode;

    @Size(max = 100, message = "Salary cannot exceed 100 characters")
    private String salary;

    @NotNull(message = "Application date is required")
    private LocalDate applicationDate;

    @NotNull(message = "Application status is required")
    private ApplicationStatus status;

    @Size(max = 500, message = "Job URL cannot exceed 500 characters")
    @Pattern(regexp = "^$|^https?://.*", message = "Job URL must start with http:// or https://")
    private String jobUrl;

    @Size(max = 120, message = "Recruiter name cannot exceed 120 characters")
    private String recruiterName;

    @Email(message = "Please provide a valid recruiter email")
    @Size(max = 150, message = "Recruiter email cannot exceed 150 characters")
    private String recruiterEmail;

    @Size(max = 10000, message = "Notes are too long")
    private String notes;
}
