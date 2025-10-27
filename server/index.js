#!/usr/bin/env node

/**
 * YNAB MCP Server
 *
 * Provides access to YNAB API through Model Context Protocol
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from "@modelcontextprotocol/sdk/types.js";

import { TOOL_DEFINITIONS } from "./tool-definitions.js";
import { YnabClient } from "./ynab-client.js";
import { YnabLogger, ParameterProcessor } from "./utils.js";
import { SERVER_CONFIG } from "./server-config.js";

class YnabServer {
  constructor() {
    this.server = new Server(
      {
        name: SERVER_CONFIG.name,
        version: SERVER_CONFIG.version,
      },
      {
        capabilities: SERVER_CONFIG.capabilities,
      }
    );

    // Don't initialize the YNAB client here - do it lazily when first needed
    // This allows the server to start even without an API token configured
    this.ynabClient = null;
    this.setupHandlers();
  }

  // Lazy initialization of YNAB client
  getYnabClient() {
    if (!this.ynabClient) {
      const apiToken = process.env.YNAB_API_TOKEN;
      if (!apiToken) {
        throw new McpError(
          ErrorCode.InvalidRequest,
          "YNAB_API_TOKEN environment variable is required. " +
          "Please configure your API token in Claude Desktop settings. " +
          "Get your personal access token from https://app.ynab.com/settings/developer"
        );
      }
      this.ynabClient = new YnabClient(apiToken);
    }
    return this.ynabClient;
  }

  setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: TOOL_DEFINITIONS,
    }));

    // Execute tool requests
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        // Process parameters for consistency and validation
        const processedArgs = ParameterProcessor.process(args || {});

        // Execute the tool
        const result = await this.executeTool(name, processedArgs);

        return {
          content: [
            {
              type: "text",
              text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        YnabLogger.error(`Tool execution failed: ${name}`, {
          error: error.message,
          args: args
        });
        throw error;
      }
    });

    // Error handling
    this.server.onerror = (error) => {
      YnabLogger.error("MCP Server Error", {
        error: error.message,
        stack: error.stack
      });
    };

    // Graceful shutdown
    process.on("SIGINT", async () => {
      YnabLogger.info("Received SIGINT, shutting down gracefully");
      await this.server.close();
      process.exit(0);
    });
  }

  async executeTool(name, args) {
    YnabLogger.debug(`Executing tool: ${name}`, { args });

    // Get the client (will throw error if API token not configured)
    const client = this.getYnabClient();

    switch (name) {
      // ============================================================
      // Budgets
      // ============================================================
      case "get_budgets":
        return await client.getBudgets();

      case "get_budget":
        return await client.getBudget(args.budget_id);

      case "get_budget_settings":
        return await client.getBudgetSettings(args.budget_id);

      // ============================================================
      // Accounts
      // ============================================================
      case "get_accounts":
        return await client.getAccounts(args.budget_id);

      case "get_account":
        return await client.getAccount(args.budget_id, args.account_id);

      case "create_account":
        return await client.createAccount(args.budget_id, {
          name: args.name,
          type: args.type,
          balance: args.balance
        });

      // ============================================================
      // Categories
      // ============================================================
      case "get_categories":
        return await client.getCategories(args.budget_id);

      case "get_category":
        return await client.getCategory(args.budget_id, args.category_id);

      case "get_category_for_month":
        return await client.getCategoryForMonth(
          args.budget_id,
          args.month,
          args.category_id
        );

      case "update_category_for_month":
        return await client.updateCategoryForMonth(
          args.budget_id,
          args.month,
          args.category_id,
          { budgeted: args.budgeted }
        );

      // ============================================================
      // Transactions
      // ============================================================
      case "get_transactions":
        return await client.getTransactions(args.budget_id, {
          since_date: args.since_date,
          type: args.type
        });

      case "get_transaction":
        return await client.getTransaction(args.budget_id, args.transaction_id);

      case "get_transactions_by_account":
        return await client.getTransactionsByAccount(
          args.budget_id,
          args.account_id,
          { since_date: args.since_date }
        );

      case "get_transactions_by_category":
        return await client.getTransactionsByCategory(
          args.budget_id,
          args.category_id,
          { since_date: args.since_date }
        );

      case "get_transactions_by_payee":
        return await client.getTransactionsByPayee(
          args.budget_id,
          args.payee_id,
          { since_date: args.since_date }
        );

      case "create_transaction":
        return await client.createTransaction(args.budget_id, {
          account_id: args.account_id,
          date: args.date,
          amount: args.amount,
          payee_id: args.payee_id,
          payee_name: args.payee_name,
          category_id: args.category_id,
          memo: args.memo,
          cleared: args.cleared,
          approved: args.approved !== undefined ? args.approved : false,
          flag_color: args.flag_color
        });

      case "update_transaction":
        return await client.updateTransaction(
          args.budget_id,
          args.transaction_id,
          {
            account_id: args.account_id,
            date: args.date,
            amount: args.amount,
            payee_id: args.payee_id,
            category_id: args.category_id,
            memo: args.memo,
            cleared: args.cleared,
            approved: args.approved,
            flag_color: args.flag_color
          }
        );

      case "delete_transaction":
        return await client.deleteTransaction(args.budget_id, args.transaction_id);

      // ============================================================
      // Scheduled Transactions
      // ============================================================
      case "get_scheduled_transactions":
        return await client.getScheduledTransactions(args.budget_id);

      case "get_scheduled_transaction":
        return await client.getScheduledTransaction(
          args.budget_id,
          args.scheduled_transaction_id
        );

      // ============================================================
      // Payees
      // ============================================================
      case "get_payees":
        return await client.getPayees(args.budget_id);

      case "get_payee":
        return await client.getPayee(args.budget_id, args.payee_id);

      // ============================================================
      // Months
      // ============================================================
      case "get_months":
        return await client.getMonths(args.budget_id);

      case "get_month":
        return await client.getMonth(args.budget_id, args.month);

      // ============================================================
      // Unknown tool
      // ============================================================
      default:
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
    }
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    YnabLogger.info("YNAB MCP server running on stdio");
  }
}

// Start the server
const server = new YnabServer();
server.start().catch((error) => {
  YnabLogger.error("Server startup failed", { error: error.message });
  process.exit(1);
});
