package com.jobtrack.service;

import com.jobtrack.dto.request.LoginRequest;
import com.jobtrack.dto.request.RegisterRequest;
import com.jobtrack.dto.response.AuthResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
}
