package com.jobtrack.service;

import com.jobtrack.dto.request.LoginRequest;
import com.jobtrack.dto.request.RegisterRequest;
import com.jobtrack.dto.response.AuthResponse;
import com.jobtrack.dto.response.UserProfileResponse;
import com.jobtrack.entity.Role;
import com.jobtrack.entity.User;
import com.jobtrack.exception.DuplicateResourceException;
import com.jobtrack.mapper.ApplicationMapper;
import com.jobtrack.repository.InterviewRepository;
import com.jobtrack.repository.JobApplicationRepository;
import com.jobtrack.repository.UserRepository;
import com.jobtrack.security.JwtTokenProvider;
import com.jobtrack.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private JobApplicationRepository jobApplicationRepository;
    @Mock
    private InterviewRepository interviewRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtTokenProvider jwtTokenProvider;
    @Mock
    private ApplicationMapper applicationMapper;

    @InjectMocks
    private AuthServiceImpl authService;

    @Test
    void register_ShouldEncodePasswordSaveUserAndReturnToken() {
        RegisterRequest request = RegisterRequest.builder()
                .name("Alex Mercer")
                .email("Alex@Example.com")
                .password("StrongPass123")
                .build();

        User savedUser = User.builder()
                .id(1L)
                .name("Alex Mercer")
                .email("alex@example.com")
                .password("encoded-password")
                .role(Role.ROLE_USER)
                .createdAt(LocalDateTime.now())
                .build();

        UserProfileResponse profile = UserProfileResponse.builder()
                .id(1L)
                .name("Alex Mercer")
                .email("alex@example.com")
                .role(Role.ROLE_USER)
                .build();

        when(userRepository.existsByEmailIgnoreCase("alex@example.com")).thenReturn(false);
        when(passwordEncoder.encode("StrongPass123")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtTokenProvider.generateToken("alex@example.com")).thenReturn("jwt-token-abc");
        when(jwtTokenProvider.getExpirationMs()).thenReturn(86400000L);
        when(applicationMapper.toUserProfileResponse(savedUser, 0L, 0L)).thenReturn(profile);

        AuthResponse response = authService.register(request);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertThat(userCaptor.getValue().getEmail()).isEqualTo("alex@example.com");
        assertThat(userCaptor.getValue().getPassword()).isEqualTo("encoded-password");
        assertThat(response.getToken()).isEqualTo("jwt-token-abc");
        assertThat(response.getTokenType()).isEqualTo("Bearer");
        assertThat(response.getUser().getEmail()).isEqualTo("alex@example.com");
    }

    @Test
    void register_ShouldThrowDuplicateResourceException_WhenEmailAlreadyExists() {
        RegisterRequest request = RegisterRequest.builder()
                .name("Alex")
                .email("alex@example.com")
                .password("password123")
                .build();

        when(userRepository.existsByEmailIgnoreCase("alex@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already exists");

        verify(userRepository, never()).save(any());
    }

    @Test
    void login_ShouldAuthenticateAndReturnJwtWithProfile() {
        LoginRequest request = LoginRequest.builder()
                .email("alex@example.com")
                .password("password123")
                .build();

        User user = User.builder()
                .id(10L)
                .name("Alex Mercer")
                .email("alex@example.com")
                .password("encoded")
                .role(Role.ROLE_USER)
                .build();

        UserProfileResponse profile = UserProfileResponse.builder()
                .id(10L)
                .name("Alex Mercer")
                .email("alex@example.com")
                .totalApplications(3L)
                .totalInterviews(1L)
                .build();

        when(userRepository.findByEmailIgnoreCase("alex@example.com")).thenReturn(Optional.of(user));
        when(jwtTokenProvider.generateToken("alex@example.com")).thenReturn("jwt-login-token");
        when(jwtTokenProvider.getExpirationMs()).thenReturn(86400000L);
        when(jobApplicationRepository.countByUserId(10L)).thenReturn(3L);
        when(interviewRepository.countByApplicationUserId(10L)).thenReturn(1L);
        when(applicationMapper.toUserProfileResponse(user, 3L, 1L)).thenReturn(profile);

        AuthResponse response = authService.login(request);

        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        assertThat(response.getToken()).isEqualTo("jwt-login-token");
        assertThat(response.getUser().getTotalApplications()).isEqualTo(3L);
    }
}
