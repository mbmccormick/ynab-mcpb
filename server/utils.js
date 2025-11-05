/**
 * Utility functions for YNAB MCP Server
 */

import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";

/**
 * Logger utility with different levels
 */
export class YnabLogger {
  static debug(message, data = {}) {
    if (process.env.DEBUG) {
      console.error(`[DEBUG] ${message}`, data);
    }
  }

  static info(message, data = {}) {
    console.error(`[INFO] ${message}`, data);
  }

  static warn(message, data = {}) {
    console.error(`[WARN] ${message}`, data);
  }

  static error(message, data = {}) {
    console.error(`[ERROR] ${message}`, data);
  }
}

export class InputValidator {
  /**
   * Validate string input
   */
  static validateStringInput(value, fieldName) {
    if (typeof value !== 'string') {
      throw new Error(`${fieldName} must be a string`);
    }
    return value;
  }

  /**
   * Validate date input format
   */
  static validateDateInput(value, fieldName) {
    if (typeof value !== 'string') {
      throw new Error(`${fieldName} must be a string`);
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) {
      throw new Error(`${fieldName} must be in YYYY-MM-DD format`);
    }

    const date = new Date(value + 'T00:00:00');
    if (isNaN(date.getTime())) {
      throw new Error(`${fieldName} is not a valid date`);
    }

    return value;
  }

  /**
   * Validate array input
   */
  static validateArrayInput(value, fieldName) {
    if (!Array.isArray(value)) {
      throw new Error(`${fieldName} must be an array`);
    }

    for (const item of value) {
      if (typeof item !== 'string') {
        throw new Error(`${fieldName} must contain only strings`);
      }
    }

    return value;
  }

  /**
   * Validate number input
   */
  static validateNumberInput(value, fieldName) {
    if (typeof value !== 'number') {
      throw new Error(`${fieldName} must be a number`);
    }

    return value;
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

export class MilliunitConverter {
  /**
   * Convert dollars to YNAB milliunits
   */
  static toMilliunits(dollars) {
    return Math.round(dollars * 1000);
  }

  /**
   * Convert YNAB milliunits to dollars
   */
  static toDollars(milliunits) {
    return milliunits / 1000;
  }

  /**
   * Format currency for display
   */
  static formatCurrency(milliunits) {
    const dollars = this.toDollars(milliunits);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(dollars);
  }
}
