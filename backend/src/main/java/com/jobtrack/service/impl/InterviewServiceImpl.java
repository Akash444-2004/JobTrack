package com.jobtrack.service.impl;

import com.jobtrack.dto.request.InterviewRequest;
import com.jobtrack.dto.response.InterviewResponse;
import com.jobtrack.entity.Interview;
import com.jobtrack.entity.InterviewOutcome;
import com.jobtrack.entity.JobApplication;
import com.jobtrack.exception.ResourceNotFoundException;
import com.jobtrack.mapper.ApplicationMapper;
import com.jobtrack.repository.InterviewRepository;
import com.jobtrack.repository.JobApplicationRepository;
import com.jobtrack.service.InterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InterviewServiceImpl implements InterviewService {

    private final InterviewRepository interviewRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final ApplicationMapper applicationMapper;

    @Override
    @Transactional
    public InterviewResponse createInterview(Long userId, Long applicationId, InterviewRequest request) {
        JobApplication application = jobApplicationRepository.findByIdAndUserId(applicationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Job application not found with id: " + applicationId));

        Interview interview = applicationMapper.toInterviewEntity(request, application);
        Interview saved = interviewRepository.save(interview);
        return applicationMapper.toInterviewResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewResponse> getInterviewsByApplication(Long userId, Long applicationId) {
        if (jobApplicationRepository.findByIdAndUserId(applicationId, userId).isEmpty()) {
            throw new ResourceNotFoundException("Job application not found with id: " + applicationId);
        }

        return interviewRepository.findByApplicationIdOrderByInterviewDateAscInterviewTimeAsc(applicationId)
                .stream()
                .map(applicationMapper::toInterviewResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InterviewResponse> getAllUserInterviews(Long userId, InterviewOutcome outcome) {
        List<Interview> interviews = outcome != null
                ? interviewRepository.findByUserIdAndOutcomeWithApplication(userId, outcome)
                : interviewRepository.findAllByUserIdWithApplication(userId);

        return interviews.stream()
                .map(applicationMapper::toInterviewResponse)
                .toList();
    }

    @Override
    @Transactional
    public InterviewResponse updateInterview(Long userId, Long interviewId, InterviewRequest request) {
        Interview interview = interviewRepository.findByIdAndApplicationUserId(interviewId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Interview not found with id: " + interviewId));

        applicationMapper.updateInterviewEntity(interview, request);
        Interview updated = interviewRepository.save(interview);
        return applicationMapper.toInterviewResponse(updated);
    }

    @Override
    @Transactional
    public void deleteInterview(Long userId, Long interviewId) {
        Interview interview = interviewRepository.findByIdAndApplicationUserId(interviewId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Interview not found with id: " + interviewId));

        interviewRepository.delete(interview);
    }
}
