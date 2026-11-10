package com.jobtrack.service.impl;

import com.jobtrack.dto.request.UpdateProfileRequest;
import com.jobtrack.dto.response.UserProfileResponse;
import com.jobtrack.entity.User;
import com.jobtrack.exception.BadRequestException;
import com.jobtrack.exception.DuplicateResourceException;
import com.jobtrack.exception.ResourceNotFoundException;
import com.jobtrack.mapper.ApplicationMapper;
import com.jobtrack.repository.InterviewRepository;
import com.jobtrack.repository.JobApplicationRepository;
import com.jobtrack.repository.UserRepository;
import com.jobtrack.security.JwtTokenProvider;
import com.jobtrack.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final InterviewRepository interviewRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final ApplicationMapper applicationMapper;

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        long totalApplications = jobApplicationRepository.countByUserId(userId);
        long totalInterviews = interviewRepository.countByApplicationUserId(userId);
        return applicationMapper.toUserProfileResponse(user, totalApplications, totalInterviews);
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String normalizedEmail = request.getEmail().trim().toLowerCase();
        boolean emailChanged = !user.getEmail().equalsIgnoreCase(normalizedEmail);

        if (emailChanged && userRepository.existsByEmailIgnoreCaseAndIdNot(normalizedEmail, userId)) {
            throw new DuplicateResourceException("This email address is already registered to another account");
        }

        if (StringUtils.hasText(request.getNewPassword())) {
            if (!StringUtils.hasText(request.getCurrentPassword())) {
                throw new BadRequestException("Current password is required to set a new password");
            }
            if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                throw new BadRequestException("Current password is incorrect");
            }
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        user.setName(request.getName().trim());
        user.setEmail(normalizedEmail);
        User updatedUser = userRepository.save(user);

        String freshToken = emailChanged ? jwtTokenProvider.generateToken(updatedUser.getEmail()) : null;
        long totalApplications = jobApplicationRepository.countByUserId(userId);
        long totalInterviews = interviewRepository.countByApplicationUserId(userId);

        return applicationMapper.toUserProfileResponse(
                updatedUser, totalApplications, totalInterviews, freshToken);
    }
}
