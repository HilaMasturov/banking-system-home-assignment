/**
 * Configuration for account masking operations
 * Centralizes masking preferences and makes the system configurable
 */

export interface AccountMaskingConfig {
  // Default masking settings
  defaultVisibleDigits: number;
  defaultMaskCharacter: string;
  
  // Security settings
  allowUnmaskedForAdmins: boolean;
  requireMaskingForUsers: boolean;
  
  // Display settings
  showMaskedIndicator: boolean;
  maskedIndicatorText: string;
  
  // Performance settings
  enableLookupCache: boolean;
  cacheExpiryMs: number;
}

/**
 * Default configuration for account masking
 */
export const defaultAccountMaskingConfig: AccountMaskingConfig = {
  defaultVisibleDigits: 4,
  defaultMaskCharacter: '*',
  allowUnmaskedForAdmins: false,
  requireMaskingForUsers: true,
  showMaskedIndicator: true,
  maskedIndicatorText: 'Masked',
  enableLookupCache: true,
  cacheExpiryMs: 5 * 60 * 1000, // 5 minutes
};

/**
 * Production configuration with stricter security
 */
export const productionAccountMaskingConfig: AccountMaskingConfig = {
  ...defaultAccountMaskingConfig,
  allowUnmaskedForAdmins: false,
  requireMaskingForUsers: true,
  showMaskedIndicator: true,
  maskedIndicatorText: 'Protected',
};

/**
 * Development configuration with more relaxed security
 */
export const developmentAccountMaskingConfig: AccountMaskingConfig = {
  ...defaultAccountMaskingConfig,
  allowUnmaskedForAdmins: true,
  requireMaskingForUsers: false,
  showMaskedIndicator: false,
  maskedIndicatorText: 'Dev Mode',
};

/**
 * Get the appropriate masking configuration based on environment
 */
export const getAccountMaskingConfig = (): AccountMaskingConfig => {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    return productionAccountMaskingConfig;
  }
  
  if (isDevelopment) {
    return developmentAccountMaskingConfig;
  }
  
  return defaultAccountMaskingConfig;
};

/**
 * Validate masking configuration
 */
export const validateAccountMaskingConfig = (config: AccountMaskingConfig): string[] => {
  const errors: string[] = [];
  
  if (config.defaultVisibleDigits < 1) {
    errors.push('defaultVisibleDigits must be at least 1');
  }
  
  if (config.defaultVisibleDigits > 10) {
    errors.push('defaultVisibleDigits cannot exceed 10');
  }
  
  if (!config.defaultMaskCharacter || config.defaultMaskCharacter.length !== 1) {
    errors.push('defaultMaskCharacter must be a single character');
  }
  
  if (config.cacheExpiryMs < 0) {
    errors.push('cacheExpiryMs cannot be negative');
  }
  
  return errors;
};
