/**
 * Currency formatting utilities
 * 
 * These functions handle conversion between numeric values and formatted
 * currency strings for display and input parsing.
 */

/**
 * Format a number as currency (USD)
 * @param amount - The numeric amount to format
 * @returns Formatted string like "$1,234.56"
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Parse a currency input string to a number
 * Removes currency symbols, commas, and whitespace
 * @param input - The input string (e.g., "$1,234.56" or "1234.56")
 * @returns The parsed number, or 0 if invalid
 */
export function parseCurrencyInput(input: string): number {
  // Remove currency symbols, commas, and whitespace
  const cleaned = input.replace(/[$,\s]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

