/**
 * Utility functions for account-related operations
 */

/**
 * Masks an account number to show only the last 4 digits
 * @param accountNumber - The full account number to mask
 * @returns The masked account number in format "****1234"
 */
export const maskAccountNumber = (accountNumber: string): string => {
  if (!accountNumber || accountNumber.length < 4) {
    return accountNumber;
  }
  return `****${accountNumber.slice(-4)}`;
};

/**
 * Masks an account number with custom mask character and visible digits
 * @param accountNumber - The full account number to mask
 * @param visibleDigits - Number of digits to show at the end (default: 4)
 * @param maskChar - Character to use for masking (default: '*')
 * @returns The masked account number
 */
export const maskAccountNumberCustom = (
  accountNumber: string, 
  visibleDigits: number = 4, 
  maskChar: string = '*'
): string => {
  if (!accountNumber || accountNumber.length < visibleDigits) {
    return accountNumber;
  }
  const mask = maskChar.repeat(accountNumber.length - visibleDigits);
  return `${mask}${accountNumber.slice(-visibleDigits)}`;
};

/**
 * Account identifier interface for masking operations
 */
export interface AccountIdentifier {
  accountId: string;
  accountNumber: string;
}

/**
 * Gets a masked account number from an account ID using a list of accounts
 * @param accountId - The account ID to look up
 * @param accounts - Array of accounts with accountId and accountNumber
 * @returns The masked account number or the accountId if not found
 */
export const getMaskedAccountNumber = (
  accountId: string, 
  accounts: AccountIdentifier[]
): string => {
  const account = accounts.find(acc => acc.accountId === accountId);
  return account ? maskAccountNumber(account.accountNumber) : accountId;
};

/**
 * Gets a masked account number with custom parameters
 * @param accountId - The account ID to look up
 * @param accounts - Array of accounts with accountId and accountNumber
 * @param visibleDigits - Number of digits to show at the end
 * @param maskChar - Character to use for masking
 * @returns The masked account number or the accountId if not found
 */
export const getMaskedAccountNumberCustom = (
  accountId: string, 
  accounts: AccountIdentifier[],
  visibleDigits: number = 4,
  maskChar: string = '*'
): string => {
  const account = accounts.find(acc => acc.accountId === accountId);
  return account ? maskAccountNumberCustom(account.accountNumber, visibleDigits, maskChar) : accountId;
};

/**
 * Creates a lookup map for better performance when masking multiple account numbers
 * @param accounts - Array of accounts with accountId and accountNumber
 * @returns A Map for fast account lookups
 */
export const createAccountLookupMap = (accounts: AccountIdentifier[]): Map<string, string> => {
  const lookupMap = new Map<string, string>();
  accounts.forEach(account => {
    lookupMap.set(account.accountId, maskAccountNumber(account.accountNumber));
  });
  return lookupMap;
};

/**
 * Gets masked account numbers for multiple account IDs using a lookup map
 * @param accountIds - Array of account IDs to mask
 * @param lookupMap - Pre-created lookup map for performance
 * @returns Array of masked account numbers
 */
export const getMaskedAccountNumbersBatch = (
  accountIds: string[],
  lookupMap: Map<string, string>
): string[] => {
  return accountIds.map(accountId => lookupMap.get(accountId) || accountId);
};
