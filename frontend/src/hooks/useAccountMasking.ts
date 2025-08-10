import { useMemo } from 'react';
import { Account } from '../components/services/accountService';
import { 
  createAccountLookupMap, 
  getMaskedAccountNumber as getMaskedAccountNumberUtil, 
  getMaskedAccountNumberCustom as getMaskedAccountNumberCustomUtil,
  AccountIdentifier 
} from '../lib/accountUtils';
import { getAccountMaskingConfig } from '../lib/accountMaskingConfig';

/**
 * Custom hook for managing account masking operations
 * Provides optimized account masking with memoized lookup maps and configuration
 */
export const useAccountMasking = (accounts: Account[]) => {
  // Get the current masking configuration
  const config = getAccountMaskingConfig();

  // Create memoized account lookup map for performance
  const accountLookupMap = useMemo(() => {
    if (!config.enableLookupCache) {
      return new Map<string, string>();
    }
    
    const accountIdentifiers: AccountIdentifier[] = accounts.map(account => ({
      accountId: account.accountId,
      accountNumber: account.accountNumber
    }));
    return createAccountLookupMap(accountIdentifiers);
  }, [accounts, config.enableLookupCache]);

  // Create memoized account identifiers array
  const accountIdentifiers = useMemo(() => {
    return accounts.map(account => ({
      accountId: account.accountId,
      accountNumber: account.accountNumber
    }));
  }, [accounts]);

  /**
   * Get masked account number for a single account ID
   * Uses the lookup map for optimal performance if caching is enabled
   */
  const getMaskedAccountNumber = (accountId: string): string => {
    if (config.enableLookupCache && accountLookupMap.has(accountId)) {
      return accountLookupMap.get(accountId) || accountId;
    }
    
    return getMaskedAccountNumberUtil(accountId, accountIdentifiers);
  };

  /**
   * Get masked account number with custom parameters
   * Falls back to lookup map if custom parameters match defaults and caching is enabled
   */
  const getMaskedAccountNumberCustom = (
    accountId: string,
    visibleDigits?: number,
    maskChar?: string
  ): string => {
    const digits = visibleDigits ?? config.defaultVisibleDigits;
    const mask = maskChar ?? config.defaultMaskCharacter;
    
    // If using default parameters and caching is enabled, use the lookup map for performance
    if (config.enableLookupCache && 
        digits === config.defaultVisibleDigits && 
        mask === config.defaultMaskCharacter &&
        accountLookupMap.has(accountId)) {
      return accountLookupMap.get(accountId) || accountId;
    }
    
    // Otherwise, use the custom function
    return getMaskedAccountNumberCustomUtil(accountId, accountIdentifiers, digits, mask);
  };

  /**
   * Get masked account numbers for multiple account IDs
   * Uses the lookup map for optimal performance if caching is enabled
   */
  const getMaskedAccountNumbers = (accountIds: string[]): string[] => {
    if (config.enableLookupCache) {
      return accountIds.map(accountId => accountLookupMap.get(accountId) || accountId);
    }
    
    return accountIds.map(accountId => 
      getMaskedAccountNumberUtil(accountId, accountIdentifiers)
    );
  };

  /**
   * Check if an account ID exists in the accounts list
   */
  const hasAccount = (accountId: string): boolean => {
    if (config.enableLookupCache) {
      return accountLookupMap.has(accountId);
    }
    
    return accountIdentifiers.some(acc => acc.accountId === accountId);
  };

  /**
   * Get the full account number for an account ID (unmasked)
   * Useful for admin operations or when full details are needed
   * Respects security configuration
   */
  const getFullAccountNumber = (accountId: string): string | undefined => {
    if (!config.allowUnmaskedForAdmins) {
      console.warn('Access to unmasked account numbers is restricted');
      return undefined;
    }
    
    const account = accounts.find(acc => acc.accountId === accountId);
    return account?.accountNumber;
  };

  /**
   * Get masked account number with indicator if configured
   */
  const getMaskedAccountNumberWithIndicator = (accountId: string): string => {
    const masked = getMaskedAccountNumber(accountId);
    
    if (config.showMaskedIndicator) {
      return `${masked} (${config.maskedIndicatorText})`;
    }
    
    return masked;
  };

  /**
   * Get the current masking configuration
   */
  const getConfig = () => config;

  return {
    getMaskedAccountNumber,
    getMaskedAccountNumberCustom,
    getMaskedAccountNumbers,
    getMaskedAccountNumberWithIndicator,
    hasAccount,
    getFullAccountNumber,
    getConfig,
    accountLookupMap,
    accountIdentifiers
  };
};
