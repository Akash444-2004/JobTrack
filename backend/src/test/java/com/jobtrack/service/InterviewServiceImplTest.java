package com.jobtrack.service;

import com.jobtrack.dto.request.InterviewRequest;
import com.jobtrack.dto.response.InterviewResponse;
import com.jobtrack.entity.Interview;
import com.jobtrack.entity.InterviewOutcome;
import com.jobtrack.entity.JobApplication;
import com.jobtrack.exception.ResourceNotFoundException;
import com.jobtrack.mapper.ApplicationMapper;
import com.jobtrack.repository.InterviewRepository;
import com.jobtrack.repository.JobApplicationRepository;
import com.jobtrack.service.impl.InterviewServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InterviewServiceImplTest {

    @Mock
    private InterviewRepository interviewRepository;
    @Mock
    private JobApplicationRepository jobApplicationRepository;
    @Mock
    private ApplicationMapper applicationMapper;

    @InjectMocks
    private InterviewServiceImpl interviewService;

    @Test
    void createInterview_ShouldSaveForOwnedApplication() {
        JobApplication application = JobApplication.builder().id(5L).companyName("Stripe").build();
        InterviewRequest request = InterviewRequest.builder()
                .interviewRound("Technical Round 1")
                .interviewDate(LocalDate.of(2026, 11, 20))
                .interviewTime(LocalTime.of(11, 0))
                .outcome(InterviewOutcome.SCHEDULED)
                .build();

        Interview entity = Interview.builder().interviewRound("Technical Round 1").application(application).build();
        Interview saved = Interview.builder().id(20L).interviewRound("Technical Round 1").application(application).build();
        InterviewResponse expected = InterviewResponse.builder().id(20L).interviewRound("Technical Round 1").applicationId(5L).build();

        when(jobApplicationRepository.findByIdAndUserId(5L, 1L)).thenReturn(Optional.of(application));
        when(applicationMapper.toInterviewEntity(request, application)).thenReturn(entity);
        when(interviewRepository.save(entity)).thenReturn(saved);
        when(applicationMapper.toInterviewResponse(saved)).thenReturn(expected);

        InterviewResponse response = interviewService.createInterview(1L, 5L, request);

        assertThat(response.getId()).isEqualTo(20L);
        assertThat(response.getApplicationId()).isEqualTo(5L);
    }

    @Test
    void createInterview_ShouldThrowNotFound_WhenApplicationNotOwned() {
        InterviewRequest request = InterviewRequest.builder()
                .interviewRound("HR")
                .interviewDate(LocalDate.now())
                .interviewTime(LocalTime.NOON)
                .build();

        when(jobApplicationRepository.findByIdAndUserId(99L, 2L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> interviewService.createInterview(2L, 99L, request))
                .isInstanceOf(ResourceNotFoundException.class);
        verify(interviewRepository, never()).save(any());
    }

    @Test
    void getAllUserInterviews_ShouldFilterByOutcomeWhenProvided() {
        Interview interview = Interview.builder().id(1L).outcome(InterviewOutcome.PASSED).build();
        InterviewResponse mapped = InterviewResponse.builder().id(1L).outcome(InterviewOutcome.PASSED).build();

        when(interviewRepository.findByUserIdAndOutcomeWithApplication(1L, InterviewOutcome.PASSED))
                .thenReturn(List.of(interview));
        when(applicationMapper.toInterviewResponse(interview)).thenReturn(mapped);

        List<InterviewResponse> results = interviewService.getAllUserInterviews(1L, InterviewOutcome.PASSED);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getOutcome()).isEqualTo(InterviewOutcome.PASSED);
    }

    @Test
    void deleteInterview_ShouldDeleteOwnedInterview() {
        Interview interview = Interview.builder().id(7L).build();
        when(interviewRepository.findByIdAndApplicationUserId(7L, 1L)).thenReturn(Optional.of(interview));

        interviewService.deleteInterview(1L, 7L);

        verify(interviewRepository).delete(interview);
    }
}
