package com.jobtrack.service.impl;

import com.jobtrack.dto.request.JobApplicationRequest;
import com.jobtrack.dto.request.StatusUpdateRequest;
import com.jobtrack.dto.response.JobApplicationResponse;
import com.jobtrack.dto.response.PagedResponse;
import com.jobtrack.entity.*;
import com.jobtrack.exception.ResourceNotFoundException;
import com.jobtrack.mapper.ApplicationMapper;
import com.jobtrack.repository.ApplicationStatusHistoryRepository;
import com.jobtrack.repository.InterviewRepository;
import com.jobtrack.repository.JobApplicationRepository;
import com.jobtrack.repository.UserRepository;
import com.jobtrack.service.JobApplicationService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class JobApplicationServiceImpl implements JobApplicationService {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "applicationDate",
            "companyName",
            "jobTitle",
            "status",
            "createdAt",
            "updatedAt",
            "salary"
    );

    private final JobApplicationRepository jobApplicationRepository;
    private final ApplicationStatusHistoryRepository statusHistoryRepository;
    private final InterviewRepository interviewRepository;
    private final UserRepository userRepository;
    private final ApplicationMapper applicationMapper;

    @Override
    @Transactional
    public JobApplicationResponse createApplication(Long userId, JobApplicationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        JobApplication application = applicationMapper.toEntity(request, user);
        JobApplication saved = jobApplicationRepository.save(application);

        ApplicationStatusHistory initialHistory = ApplicationStatusHistory.builder()
                .previousStatus(null)
                .newStatus(saved.getStatus())
                .application(saved)
                .build();
        ApplicationStatusHistory savedHistory = statusHistoryRepository.save(initialHistory);

        return applicationMapper.toDetailedResponse(saved, List.of(savedHistory), List.of());
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<JobApplicationResponse> getApplications(
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
    ) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(1, size), 100);
        String resolvedSortBy = ALLOWED_SORT_FIELDS.contains(sortBy) ? sortBy : "applicationDate";
        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;

        Pageable pageable = PageRequest.of(
                safePage,
                safeSize,
                Sort.by(direction, resolvedSortBy).and(Sort.by(Sort.Direction.DESC, "id"))
        );

        Specification<JobApplication> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("user").get("id"), userId));

            if (StringUtils.hasText(keyword)) {
                String pattern = "%" + keyword.trim().toLowerCase() + "%";
                Predicate companyLike = cb.like(cb.lower(root.get("companyName")), pattern);
                Predicate titleLike = cb.like(cb.lower(root.get("jobTitle")), pattern);
                Predicate locationLike = cb.like(cb.lower(cb.coalesce(root.get("location"), "")), pattern);
                Predicate recruiterLike = cb.like(cb.lower(cb.coalesce(root.get("recruiterName"), "")), pattern);
                predicates.add(cb.or(companyLike, titleLike, locationLike, recruiterLike));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (jobType != null) {
                predicates.add(cb.equal(root.get("jobType"), jobType));
            }
            if (workMode != null) {
                predicates.add(cb.equal(root.get("workMode"), workMode));
            }
            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("applicationDate"), fromDate));
            }
            if (toDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("applicationDate"), toDate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<JobApplication> results = jobApplicationRepository.findAll(spec, pageable);
        List<JobApplicationResponse> content = results.getContent().stream()
                .map(applicationMapper::toSummaryResponse)
                .toList();

        return PagedResponse.<JobApplicationResponse>builder()
                .content(content)
                .page(results.getNumber())
                .size(results.getSize())
                .totalElements(results.getTotalElements())
                .totalPages(results.getTotalPages())
                .first(results.isFirst())
                .last(results.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public JobApplicationResponse getApplicationById(Long userId, Long applicationId) {
        JobApplication application = findOwnedApplication(userId, applicationId);
        List<ApplicationStatusHistory> history =
                statusHistoryRepository.findByApplicationIdOrderByChangedAtDesc(applicationId);
        List<Interview> interviews =
                interviewRepository.findByApplicationIdOrderByInterviewDateAscInterviewTimeAsc(applicationId);

        return applicationMapper.toDetailedResponse(application, history, interviews);
    }

    @Override
    @Transactional
    public JobApplicationResponse updateApplication(
            Long userId,
            Long applicationId,
            JobApplicationRequest request
    ) {
        JobApplication application = findOwnedApplication(userId, applicationId);
        ApplicationStatus previousStatus = application.getStatus();

        applicationMapper.updateEntity(application, request);
        JobApplication updated = jobApplicationRepository.save(application);

        if (!Objects.equals(previousStatus, updated.getStatus())) {
            ApplicationStatusHistory historyEntry = ApplicationStatusHistory.builder()
                    .previousStatus(previousStatus)
                    .newStatus(updated.getStatus())
                    .application(updated)
                    .build();
            statusHistoryRepository.save(historyEntry);
        }

        List<ApplicationStatusHistory> history =
                statusHistoryRepository.findByApplicationIdOrderByChangedAtDesc(applicationId);
        List<Interview> interviews =
                interviewRepository.findByApplicationIdOrderByInterviewDateAscInterviewTimeAsc(applicationId);

        return applicationMapper.toDetailedResponse(updated, history, interviews);
    }

    @Override
    @Transactional
    public JobApplicationResponse updateApplicationStatus(
            Long userId,
            Long applicationId,
            StatusUpdateRequest request
    ) {
        JobApplication application = findOwnedApplication(userId, applicationId);
        ApplicationStatus previousStatus = application.getStatus();

        if (!Objects.equals(previousStatus, request.getStatus())) {
            application.setStatus(request.getStatus());
            jobApplicationRepository.save(application);

            ApplicationStatusHistory historyEntry = ApplicationStatusHistory.builder()
                    .previousStatus(previousStatus)
                    .newStatus(request.getStatus())
                    .application(application)
                    .build();
            statusHistoryRepository.save(historyEntry);
        }

        List<ApplicationStatusHistory> history =
                statusHistoryRepository.findByApplicationIdOrderByChangedAtDesc(applicationId);
        List<Interview> interviews =
                interviewRepository.findByApplicationIdOrderByInterviewDateAscInterviewTimeAsc(applicationId);

        return applicationMapper.toDetailedResponse(application, history, interviews);
    }

    @Override
    @Transactional
    public void deleteApplication(Long userId, Long applicationId) {
        JobApplication application = findOwnedApplication(userId, applicationId);
        jobApplicationRepository.delete(application);
    }

    private JobApplication findOwnedApplication(Long userId, Long applicationId) {
        return jobApplicationRepository.findByIdAndUserId(applicationId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Job application not found with id: " + applicationId));
    }
}
