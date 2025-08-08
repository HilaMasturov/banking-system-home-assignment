package com.banking.transactionservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class ApiVersionConfig implements WebMvcConfigurer {
    
    // API versioning is handled through @RequestMapping("/api/v1/...") annotations
    // This ensures all endpoints are properly versioned
}
