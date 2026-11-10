package com.jobtrack.dto.response;

import com.jobtrack.entity.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatusHistoryResponse {
    private Long id;
    private ApplicationStatus previousStatus;
    private ApplicationStatus newStatus;
    private LocalDateTime changedAt;
}
