package com.jobtrack.service;

import com.jobtrack.dto.request.UpdateProfileRequest;
import com.jobtrack.dto.response.UserProfileResponse;
import com.jobtrack.entity.Role;
import com.jobtrack.entity.User;
import com.jobtrack.exception.BadRequestException;
import com.jobtrack.mapper.ApplicationMapper;
import com.jobtrack.repository.InterviewRepository;
import com.jobtrack.repository.JobApplicationRepository;
import com.jobtrack.repository.UserRepository;
import com.jobtrack.security.JwtTokenProvider;
import com.jobtrack.service.impl.UserServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private JobApplicationRepository jobApplicationRepository;
    @Mock
    private InterviewRepository interviewRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtTokenProvider jwtTokenProvider;
    @Mock
    private ApplicationMapper applicationMapper;

    @InjectMocks
    private UserServiceImpl userService;

    @Test
    void updateProfile_ShouldThrowBadRequest_WhenCurrentPasswordIsWrong() {
        User user = User.builder()
                .id(1L)
                .name("Alex")
                .email("alex@example.com")
                .password("encoded-old")
                .role(Role.ROLE_USER)
                .build();

        UpdateProfileRequest request = UpdateProfileRequest.builder()
                .name("Alex")
                .email("alex@example.com")
                .currentPassword("wrong")
                .newPassword("newSecret123")
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "encoded-old")).thenReturn(false);

        assertThatThrownBy(() -> userService.updateProfile(1L, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("incorrect");
    }

    @Test
    void updateProfile_ShouldIssueFreshToken_WhenEmailChanges() {
        User user = User.builder()
                .id(1L)
                .name("Alex")
                .email("old@example.com")
                .password("encoded")
                .role(Role.ROLE_USER)
                .build();

        UpdateProfileRequest request = UpdateProfileRequest.builder()
                .name("Alex Updated")
                .email("new@example.com")
                .build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.existsByEmailIgnoreCaseAndIdNot("new@example.com", 1L)).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));
        when(jwtTokenProvider.generateToken("new@example.com")).thenReturn("fresh-jwt-token");
        when(jobApplicationRepository.countByUserId(1L)).thenReturn(4L);
        when(interviewRepository.countByApplicationUserId(1L)).thenReturn(2L);
        when(applicationMapper.toUserProfileResponse(any(User.class), any(Long.class), any(Long.class), any()))
                .thenReturn(UserProfileResponse.builder()
                        .id(1L)
                        .name("Alex Updated")
                        .email("new@example.com")
                        .accessToken("fresh-jwt-token")
                        .build());

        UserProfileResponse response = userService.updateProfile(1L, request);

        assertThat(response.getEmail()).isEqualTo("new@example.com");
        assertThat(response.getAccessToken()).isEqualTo("fresh-jwt-token");
    }
}
