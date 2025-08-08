package com.banking.accountservice.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
public class CacheConfig {

                    @Bean
                public CacheManager cacheManager() {
                    CaffeineCacheManager cacheManager = new CaffeineCacheManager(
                        "customers", "accountExists", "customerExists", "allCustomers", "customerExistsByEmail"
                    );
                    cacheManager.setCaffeine(caffeineCacheBuilder());
                    return cacheManager;
                }

    private Caffeine<Object, Object> caffeineCacheBuilder() {
        return Caffeine.newBuilder()
                .initialCapacity(100)
                .maximumSize(1000)
                .expireAfterWrite(Duration.ofMinutes(10))
                .expireAfterAccess(Duration.ofMinutes(5))
                .recordStats();
    }
}