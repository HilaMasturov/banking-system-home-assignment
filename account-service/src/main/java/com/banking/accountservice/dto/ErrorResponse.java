package com.banking.accountservice.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ErrorResponse {
    private String message;
    private String error;
    private int status;
    private String path;
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}
