package com.jobtrack.service;

import com.jobtrack.dto.request.JobApplicationRequest;
import com.jobtrack.dto.response.JobApplicationResponse;
import com.jobtrack.entity.*;
import com.jobtrack.exception.ResourceNotFoundException;
import com.jobtrack.mapper.ApplicationMapper;
import com.jobtrack.repository.ApplicationStatusHistoryRepository;
import com.jobtrack.repository.InterviewRepository;
import com.jobtrack.repository.JobApplicationRepository;
import com.jobtrack.repository.UserRepository;
import com.jobtrack.service.impl.JobApplicationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobApplicationServiceImplTest {

    @Mock
    private JobApplicationRepository jobApplicationRepository;
    @Mock
    private ApplicationStatusHistoryRepository statusHistoryRepository;
    @Mock
    private InterviewRepository interviewRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ApplicationMapper applicationMapper;

    @InjectMocks
    private JobApplicationServiceImpl jobApplicationService;

    private User testUser;
    private JobApplicationRequest createRequest;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .name("Test User")
                .email("user@example.com")
                .role(Role.ROLE_USER)
                .build();

        createRequest = JobApplicationRequest.builder()
                .companyName("Acme Corp")
                .jobTitle("Backend Java Engineer")
                .location("Bengaluru")
                .jobType(JobType.FULL_TIME)
                .workMode(WorkMode.HYBRID)
                .salary("22 LPA")
                .applicationDate(LocalDate.of(2026, 11, 1))
                .status(ApplicationStatus.APPLIED)
                .build();
    }

    @Test
    void createApplication_ShouldPersistAndRecordInitialStatusHistory() {
        JobApplication entity = JobApplication.builder()
                .companyName("Acme Corp")
                .jobTitle("Backend Java Engineer")
                .status(ApplicationStatus.APPLIED)
                .user(testUser)
                .build();

        JobApplication saved = JobApplication.builder()
                .id(100L)
                .companyName("Acme Corp")
                .jobTitle("Backend Java Engineer")
                .status(ApplicationStatus.APPLIED)
                .user(testUser)
                .build();

        ApplicationStatusHistory history = ApplicationStatusHistory.builder()
                .id(1L)
                .previousStatus(null)
                .newStatus(ApplicationStatus.APPLIED)
                .application(saved)
                .build();

        JobApplicationResponse expectedResponse = JobApplicationResponse.builder()
                .id(100L)
                .companyName("Acme Corp")
                .status(ApplicationStatus.APPLIED)
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(applicationMapper.toEntity(createRequest, testUser)).thenReturn(entity);
        when(jobApplicationRepository.save(entity)).thenReturn(saved);
        when(statusHistoryRepository.save(any(ApplicationStatusHistory.class))).thenReturn(history);
        when(applicationMapper.toDetailedResponse(eq(saved), anyList(), anyList())).thenReturn(expectedResponse);

        JobApplicationResponse response = jobApplicationService.createApplication(1L, createRequest);

        ArgumentCaptor<ApplicationStatusHistory> historyCaptor =
                ArgumentCaptor.forClass(ApplicationStatusHistory.class);
        verify(statusHistoryRepository).save(historyCaptor.capture());

        assertThat(historyCaptor.getValue().getPreviousStatus()).isNull();
        assertThat(historyCaptor.getValue().getNewStatus()).isEqualTo(ApplicationStatus.APPLIED);
        assertThat(response.getId()).isEqualTo(100L);
    }

    @Test
    void updateApplication_ShouldRecordHistoryOnlyWhenStatusChanges() {
        JobApplication existing = JobApplication.builder()
                .id(50L)
                .companyName("Acme Corp")
                .jobTitle("Backend Java Engineer")
                .status(ApplicationStatus.APPLIED)
                .user(testUser)
                .build();

        JobApplicationRequest updateReq = JobApplicationRequest.builder()
                .companyName("Acme Corp")
                .jobTitle("Senior Java Engineer")
                .jobType(JobType.FULL_TIME)
                .workMode(WorkMode.REMOTE)
                .applicationDate(LocalDate.of(2026, 11, 1))
                .status(ApplicationStatus.INTERVIEW)
                .build();

        when(jobApplicationRepository.findByIdAndUserId(50L, 1L)).thenReturn(Optional.of(existing));
        doAnswer(invocation -> {
            JobApplication target = invocation.getArgument(0);
            JobApplicationRequest req = invocation.getArgument(1);
            target.setStatus(req.getStatus());
            target.setJobTitle(req.getJobTitle());
            return null;
        }).when(applicationMapper).updateEntity(existing, updateReq);
        when(jobApplicationRepository.save(existing)).thenReturn(existing);
        when(statusHistoryRepository.findByApplicationIdOrderByChangedAtDesc(50L)).thenReturn(List.of());
        when(interviewRepository.findByApplicationIdOrderByInterviewDateAscInterviewTimeAsc(50L)).thenReturn(List.of());
        when(applicationMapper.toDetailedResponse(eq(existing), anyList(), anyList()))
                .thenReturn(JobApplicationResponse.builder().id(50L).status(ApplicationStatus.INTERVIEW).build());

        JobApplicationResponse response = jobApplicationService.updateApplication(1L, 50L, updateReq);

        ArgumentCaptor<ApplicationStatusHistory> historyCaptor =
                ArgumentCaptor.forClass(ApplicationStatusHistory.class);
        verify(statusHistoryRepository).save(historyCaptor.capture());
        assertThat(historyCaptor.getValue().getPreviousStatus()).isEqualTo(ApplicationStatus.APPLIED);
        assertThat(historyCaptor.getValue().getNewStatus()).isEqualTo(ApplicationStatus.INTERVIEW);
        assertThat(response.getStatus()).isEqualTo(ApplicationStatus.INTERVIEW);
    }

    @Test
    void getApplicationById_ShouldThrowNotFound_WhenNotOwnedByUser() {
        when(jobApplicationRepository.findByIdAndUserId(99L, 2L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> jobApplicationService.getApplicationById(2L, 99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void deleteApplication_ShouldDeleteOwnedApplication() {
        JobApplication existing = JobApplication.builder().id(12L).user(testUser).build();
        when(jobApplicationRepository.findByIdAndUserId(12L, 1L)).thenReturn(Optional.of(existing));

        jobApplicationService.deleteApplication(1L, 12L);

        verify(jobApplicationRepository).delete(existing);
    }
}
