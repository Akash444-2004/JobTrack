package com.jobtrack.service.impl;

import com.jobtrack.dto.request.LoginRequest;
import com.jobtrack.dto.request.RegisterRequest;
import com.jobtrack.dto.response.AuthResponse;
import com.jobtrack.dto.response.UserProfileResponse;
import com.jobtrack.entity.Role;
import com.jobtrack.entity.User;
import com.jobtrack.exception.DuplicateResourceException;
import com.jobtrack.exception.ResourceNotFoundException;
import com.jobtrack.mapper.ApplicationMapper;
import com.jobtrack.repository.InterviewRepository;
import com.jobtrack.repository.JobApplicationRepository;
import com.jobtrack.repository.UserRepository;
import com.jobtrack.security.JwtTokenProvider;
import com.jobtrack.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final InterviewRepository interviewRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final ApplicationMapper applicationMapper;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new DuplicateResourceException("An account with this email already exists");
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ROLE_USER)
                .build();

        User savedUser = userRepository.save(user);
        String token = jwtTokenProvider.generateToken(savedUser.getEmail());
        UserProfileResponse profile = applicationMapper.toUserProfileResponse(savedUser, 0L, 0L);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getExpirationMs())
                .user(profile)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
        );

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String token = jwtTokenProvider.generateToken(user.getEmail());
        long totalApplications = jobApplicationRepository.countByUserId(user.getId());
        long totalInterviews = interviewRepository.countByApplicationUserId(user.getId());
        UserProfileResponse profile = applicationMapper.toUserProfileResponse(
                user, totalApplications, totalInterviews);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getExpirationMs())
                .user(profile)
                .build();
    }
}
