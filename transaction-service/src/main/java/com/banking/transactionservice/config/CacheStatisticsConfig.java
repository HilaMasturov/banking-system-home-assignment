package com.banking.transactionservice.config;

import com.github.benmanes.caffeine.cache.stats.CacheStats;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Slf4j
@Configuration
@EnableScheduling
public class CacheStatisticsConfig {

    private final CacheManager cacheManager;

    public CacheStatisticsConfig(CacheManager cacheManager) {
        this.cacheManager = cacheManager;
    }

    @Scheduled(fixedRate = 300000) // Every 5 minutes
    public void logCacheStatistics() {
        cacheManager.getCacheNames().forEach(cacheName -> {
            var cache = cacheManager.getCache(cacheName);
            if (cache != null && cache.getNativeCache() instanceof com.github.benmanes.caffeine.cache.Cache) {
                var caffeineCache = (com.github.benmanes.caffeine.cache.Cache<?, ?>) cache.getNativeCache();
                CacheStats stats = caffeineCache.stats();
                
                log.info("Cache '{}' statistics - Hits: {}, Misses: {}, Hit Rate: {:.2f}%, Size: {}, Evictions: {}",
                    cacheName,
                    stats.hitCount(),
                    stats.missCount(),
                    stats.hitRate() * 100,
                    caffeineCache.estimatedSize(),
                    stats.evictionCount()
                );
            }
        });
    }
}
