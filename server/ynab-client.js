/**
 * YNAB API Client
 *
 * Handles all communication with the YNAB API
 */

import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { YnabLogger } from "./utils.js";
import { SERVER_CONFIG } from "./server-config.js";

export class YnabClient {
  constructor(apiToken) {
    if (!apiToken) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        "YNAB API token is required. Set the YNAB_API_TOKEN environment variable."
      );
    }

    this.apiToken = apiToken;
    this.baseUrl = SERVER_CONFIG.api.baseUrl;
    this.timeout = SERVER_CONFIG.api.timeout;
  }

  /**
   * Make a request to the YNAB API
   */
  async request(method, endpoint, data = null) {
    const url = `${this.baseUrl}${endpoint}`;
    const startTime = Date.now();

    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(this.timeout),
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    try {
      YnabLogger.debug(`YNAB API Request: ${method} ${endpoint}`, { data });

      const response = await fetch(url, options);
      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        YnabLogger.error(`YNAB API Error: ${response.status}`, {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          duration: `${duration}ms`
        });

        throw new McpError(
          ErrorCode.InternalError,
          `YNAB API error (${response.status}): ${errorData.error?.detail || response.statusText}`
        );
      }

      const result = await response.json();

      YnabLogger.debug(`YNAB API Response: ${method} ${endpoint}`, {
        duration: `${duration}ms`,
        dataSize: JSON.stringify(result).length
      });

      return result.data;

    } catch (error) {
      const duration = Date.now() - startTime;

      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        YnabLogger.error(`YNAB API Timeout: ${method} ${endpoint}`, {
          duration: `${duration}ms`,
          timeout: this.timeout
        });
        throw new McpError(
          ErrorCode.InternalError,
          `YNAB API request timed out after ${this.timeout}ms`
        );
      }

      if (error instanceof McpError) {
        throw error;
      }

      YnabLogger.error(`YNAB API Request Failed: ${method} ${endpoint}`, {
        error: error.message,
        duration: `${duration}ms`
      });

      throw new McpError(
        ErrorCode.InternalError,
        `YNAB API request failed: ${error.message}`
      );
    }
  }

  // ============================================================
  // Budgets
  // ============================================================

  async getBudgets() {
    return await this.request('GET', '/budgets');
  }

  async getBudget(budgetId) {
    return await this.request('GET', `/budgets/${budgetId}`);
  }

  async getBudgetSettings(budgetId) {
    return await this.request('GET', `/budgets/${budgetId}/settings`);
  }

  // ============================================================
  // Accounts
  // ============================================================

  async getAccounts(budgetId) {
    return await this.request('GET', `/budgets/${budgetId}/accounts`);
  }

  async getAccount(budgetId, accountId) {
    return await this.request('GET', `/budgets/${budgetId}/accounts/${accountId}`);
  }

  async createAccount(budgetId, accountData) {
    return await this.request('POST', `/budgets/${budgetId}/accounts`, { account: accountData });
  }

  // ============================================================
  // Categories
  // ============================================================

  async getCategories(budgetId) {
    return await this.request('GET', `/budgets/${budgetId}/categories`);
  }

  async getCategory(budgetId, categoryId) {
    return await this.request('GET', `/budgets/${budgetId}/categories/${categoryId}`);
  }

  async getCategoryForMonth(budgetId, month, categoryId) {
    return await this.request('GET', `/budgets/${budgetId}/months/${month}/categories/${categoryId}`);
  }

  async updateCategoryForMonth(budgetId, month, categoryId, categoryData) {
    return await this.request('PATCH', `/budgets/${budgetId}/months/${month}/categories/${categoryId}`, { category: categoryData });
  }

  // ============================================================
  // Transactions
  // ============================================================

  async getTransactions(budgetId, params = {}) {
    const queryParams = new URLSearchParams();
    if (params.since_date) queryParams.append('since_date', params.since_date);
    if (params.type) queryParams.append('type', params.type);

    const query = queryParams.toString();
    const endpoint = `/budgets/${budgetId}/transactions${query ? '?' + query : ''}`;

    return await this.request('GET', endpoint);
  }

  async getTransaction(budgetId, transactionId) {
    return await this.request('GET', `/budgets/${budgetId}/transactions/${transactionId}`);
  }

  async getTransactionsByAccount(budgetId, accountId, params = {}) {
    const queryParams = new URLSearchParams();
    if (params.since_date) queryParams.append('since_date', params.since_date);

    const query = queryParams.toString();
    const endpoint = `/budgets/${budgetId}/accounts/${accountId}/transactions${query ? '?' + query : ''}`;

    return await this.request('GET', endpoint);
  }

  async getTransactionsByCategory(budgetId, categoryId, params = {}) {
    const queryParams = new URLSearchParams();
    if (params.since_date) queryParams.append('since_date', params.since_date);

    const query = queryParams.toString();
    const endpoint = `/budgets/${budgetId}/categories/${categoryId}/transactions${query ? '?' + query : ''}`;

    return await this.request('GET', endpoint);
  }

  async getTransactionsByPayee(budgetId, payeeId, params = {}) {
    const queryParams = new URLSearchParams();
    if (params.since_date) queryParams.append('since_date', params.since_date);

    const query = queryParams.toString();
    const endpoint = `/budgets/${budgetId}/payees/${payeeId}/transactions${query ? '?' + query : ''}`;

    return await this.request('GET', endpoint);
  }

  async createTransaction(budgetId, transactionData) {
    return await this.request('POST', `/budgets/${budgetId}/transactions`, { transaction: transactionData });
  }

  async createTransactions(budgetId, transactionsData) {
    return await this.request('POST', `/budgets/${budgetId}/transactions`, { transactions: transactionsData });
  }

  async updateTransaction(budgetId, transactionId, transactionData) {
    return await this.request('PUT', `/budgets/${budgetId}/transactions/${transactionId}`, { transaction: transactionData });
  }

  async updateTransactions(budgetId, transactionsData) {
    return await this.request('PATCH', `/budgets/${budgetId}/transactions`, { transactions: transactionsData });
  }

  async deleteTransaction(budgetId, transactionId) {
    return await this.request('DELETE', `/budgets/${budgetId}/transactions/${transactionId}`);
  }

  // ============================================================
  // Scheduled Transactions
  // ============================================================

  async getScheduledTransactions(budgetId) {
    return await this.request('GET', `/budgets/${budgetId}/scheduled_transactions`);
  }

  async getScheduledTransaction(budgetId, scheduledTransactionId) {
    return await this.request('GET', `/budgets/${budgetId}/scheduled_transactions/${scheduledTransactionId}`);
  }

  // ============================================================
  // Payees
  // ============================================================

  async getPayees(budgetId) {
    return await this.request('GET', `/budgets/${budgetId}/payees`);
  }

  async getPayee(budgetId, payeeId) {
    return await this.request('GET', `/budgets/${budgetId}/payees/${payeeId}`);
  }

  // ============================================================
  // Months
  // ============================================================

  async getMonths(budgetId) {
    return await this.request('GET', `/budgets/${budgetId}/months`);
  }

  async getMonth(budgetId, month) {
    return await this.request('GET', `/budgets/${budgetId}/months/${month}`);
  }
}
