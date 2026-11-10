package com.jobtrack.service;

import com.jobtrack.dto.request.UpdateProfileRequest;
import com.jobtrack.dto.response.UserProfileResponse;

public interface UserService {
    UserProfileResponse getProfile(Long userId);
    UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request);
}
