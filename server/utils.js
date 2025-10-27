/**
 * Utility functions for YNAB MCP Server
 */

/**
 * Logger utility with different levels
 */
export class YnabLogger {
  static debug(message, data = {}) {
    if (process.env.DEBUG) {
      console.error(`[DEBUG] ${message}`, JSON.stringify(data, null, 2));
    }
  }

  static info(message, data = {}) {
    console.error(`[INFO] ${message}`, data ? JSON.stringify(data) : "");
  }

  static warn(message, data = {}) {
    console.error(`[WARN] ${message}`, JSON.stringify(data, null, 2));
  }

  static error(message, data = {}) {
    console.error(`[ERROR] ${message}`, JSON.stringify(data, null, 2));
  }
}

/**
 * Parameter processor for validation and normalization
 */
export class ParameterProcessor {
  static process(params) {
    const processed = { ...params };

    // Validate and normalize date parameters
    if (processed.date) {
      processed.date = this.validateDate(processed.date);
    }

    // Validate amounts (YNAB uses milliunits)
    if (processed.amount !== undefined) {
      processed.amount = this.validateAmount(processed.amount);
    }

    return processed;
  }

  static validateDate(dateStr) {
    // YNAB expects YYYY-MM-DD format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateStr)) {
      throw new Error(`Invalid date format: ${dateStr}. Expected YYYY-MM-DD`);
    }

    // Validate it's a real date
    const date = new Date(dateStr + 'T00:00:00Z');
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date: ${dateStr}. Not a valid calendar date`);
    }

    // Verify the date string matches the parsed date (catches invalid days like 2025-01-32)
    const [year, month, day] = dateStr.split('-');
    if (date.getUTCFullYear() !== parseInt(year) ||
        date.getUTCMonth() + 1 !== parseInt(month) ||
        date.getUTCDate() !== parseInt(day)) {
      throw new Error(`Invalid date: ${dateStr}. Not a valid calendar date`);
    }

    return dateStr;
  }

  static validateAmount(amount) {
    // Amounts should be numbers
    if (typeof amount !== 'number') {
      throw new Error(`Invalid amount: ${amount}. Expected a number`);
    }
    return amount;
  }
}

/**
 * Convert dollars to YNAB milliunits
 */
export function dollarsToMilliunits(dollars) {
  return Math.round(dollars * 1000);
}

/**
 * Convert YNAB milliunits to dollars
 */
export function milliunitsToDollars(milliunits) {
  return milliunits / 1000;
}

/**
 * Format currency for display
 */
export function formatCurrency(milliunits) {
  const dollars = milliunitsToDollars(milliunits);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(dollars);
}
