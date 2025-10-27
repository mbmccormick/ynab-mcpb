/**
 * MCP Tool Definitions for YNAB API
 *
 * Defines all available tools with their parameters and descriptions
 */

export const TOOL_DEFINITIONS = [
  // ============================================================
  // Budgets
  // ============================================================
  {
    name: "get_budgets",
    description: "Get all budgets accessible to the user",
    inputSchema: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "get_budget",
    description: "Get details of a specific budget",
    inputSchema: {
      type: "object",
      properties: {
        budget_id: {
          type: "string",
          description: "The budget ID (use 'last-used' for the last used budget)"
        }
      },
      required: ["budget_id"]
    }
  },
  {
    name: "get_budget_settings",
    description: "Get settings for a specific budget",
    inputSchema: {
      type: "object",
      properties: {
        budget_id: {
          type: "string",
          description: "The budget ID (use 'last-used' for the last used budget)"
        }
      },
      required: ["budget_id"]
    }
  },

  // ============================================================
  // Accounts
  // ============================================================
  {
    name: "get_accounts",
    description: "Get all accounts for a budget",
    inputSchema: {
      type: "object",
      properties: {
        budget_id: {
          type: "string",
          description: "The budget ID (use 'last-used' for the last used budget)"
        }
      },
      required: ["budget_id"]
    }
  },
  {
    name: "get_account",
    description: "Get a specific account",
    inputSchema: {
      type: "object",
      properties: {
        budget_id: {
          type: "string",
          description: "The budget ID (use 'last-used' for the last used budget)"
        },
        account_id: {
          type: "string",
          description: "The account ID"
        }
      },
      required: ["budget_id", "account_id"]
    }
  },
  {
    name: "create_account",
    description: "Create a new account",
    inputSchema: {
      type: "object",
      properties: {
        budget_id: {
          type: "string",
          description: "The budget ID (use 'last-used' for the last used budget)"
        },
        name: {
          type: "string",
          description: "The name of the account"
        },
        type: {
          type: "string",
          description: "The type of account (checking, savings, creditCard, cash, lineOfCredit, otherAsset, otherLiability, mortgage, autoLoan, studentLoan, personalLoan, medicalDebt, otherDebt)",
          enum: ["checking", "savings", "creditCard", "cash", "lineOfCredit", "otherAsset", "otherLiability", "mortgage", "autoLoan", "studentLoan", "personalLoan", "medicalDebt", "otherDebt"]
        },
        balance: {
          type: "number",
          description: "The current balance in milliunits format (1000 milliunits = $1)"
        }
      },
      required: ["budget_id", "name", "type", "balance"]
    }
  },

  // ============================================================
  // Categories
  // ============================================================
  {
    name: "get_categories",
    description: "Get all categories for a budget",
    inputSchema: {
      type: "object",
      properties: {
        budget_id: {
          type: "string",
          description: "The budget ID (use 'last-used' for the last used budget)"
        }
      },
      required: ["budget_id"]
    }
  },
  {
    name: "get_category",
    description: "Get a specific category",
    inputSchema: {
      type: "object",
      properties: {
        budget_id: {
          type: "string",
          description: "The budget ID (use 'last-used' for the last used budget)"
        },
        category_id: {
          type: "string",
          description: "The category ID"
        }
      },
      required: ["budget_id", "category_id"]
    }
  },
  {
    name: "get_category_for_month",
    description: "Get a category's budget data for a specific month",
    inputSchema: {
      type: "object",
      properties: {
        budget_id: {
          type: "string",
          description: "The budget ID (use 'last-used' for the last used budget)"
        },
        month: {
          type: "string",
          description: "The month in ISO format (YYYY-MM-DD), e.g., '2025-01-01' for January 2025"
        },
        category_id: {
          type: "string",
          description: "The category ID"
        }
      },
      required: ["budget_id", "month", "category_id"]
    }
  },
  {
    name: "update_category_for_month",
    description: "Update a category's budget data for a specific month (e.g., set budgeted amount)",
    inputSchema: {
      type: "object",
      properties: {
        budget_id: {
          type: "string",
          description: "The budget ID (use 'last-used' for the last used budget)"
        },
        month: {
          type: "string",
          description: "The month in ISO format (YYYY-MM-DD), e.g., '2025-01-01' for January 2025"
        },
        category_id: {
          type: "string",
          description: "The category ID"
        },
        budgeted: {
          type: "number",
          description: "The budgeted amount in milliunits format (1000 milliunits = $1)"
        }
      },
      required: ["budget_id", "month", "category_id", "budgeted"]
    }
  },

  // ============================================================
  // Transactions
  // ============================================================
  {
    name: "get_transactions",
    description: "Get all transactions for a budget",
    inputSchema: {
      type: "object",
      properties: {
        budget_id: {
          type: "string",
          description: "The budget ID (use 'last-used' for the last used budget)"
        },
        since_date: {
          type: "string",
          description: "Optional: Only return transactions on or after this date (YYYY-MM-DD format)"
        },
        type: {
          type: "string",
          description: "Optional: Filter by transaction type",
          enum: ["uncategorized", "unapproved"]
        }
      },
      required: ["budget_id"]
    }
  },
  {
    name: "get_transaction",
    description: "Get a specific transaction",
    inputSchema: {
      type: "object",
      properties: {
        budget_id: {
          type: "string",
          description: "The budget ID (use 'last-used' for the last used budget)"
        },
        transaction_id: {
          type: "string",
          description: "The transaction ID"
        }
      },
      required: ["budget_id", "transaction_id"]
    }
  },
  {
    name: "get_transactions_by_account",
    description: "Get all transactions for a specific account",
    inputSchema: {
      type: "object",
      properties: {
        budget_id: {
          type: "string",
          description: "The budget ID (use 'last-used' for the last used budget)"
        },
        account_id: {
          type: "string",
          description: "The account ID"
        },
        since_date: {
          type: "string",
          description: "Optional: Only return transactions on or after this date (YYYY-MM-DD format)"
        }
      },
      required: ["budget_id", "account_id"]
    }
  },
  {
    name: "get_transactions_by_category",
    description: "Get all transactions for a specific category",
    inputSchema: {
      type: "object",
      properties: {
        budget_id: {
          type: "string",
          description: "The budget ID (use 'last-used' for the last used budget)"
        },
        category_id: {
          type: "string",
          description: "The category ID"
        },
        since_date: {
          type: "string",
          description: "Optional: Only return transactions on or after this date (YYYY-MM-DD format)"
        }
      },
      required: ["budget_id", "category_id"]
    }
  },
  {
    name: "get_transactions_by_payee",
    description: "Get all transactions for a specific payee",
    inputSchema: {
      type: "object",
      properties: {
        budget_id: {
          type: "string",
          description: "The budget ID (use 'last-used' for the last used budget)"
        },
        payee_id: {
          type: "string",
          description: "The payee ID"
        },
        since_date: {
          type: "string",
          description: "Optional: Only return transactions on or after this date (YYYY-MM-DD format)"
        }
      },
      required: ["budget_id", "payee_id"]
    }
  },
  {
    name: "create_transaction",
    description: "Create a new transaction",
    inputSchema: {
      type: "object",
      properties: {
        budget_id: {
          type: "string",
          description: "The budget ID (use 'last-used' for the last used budget)"
        },
        account_id: {
          type: "string",
          description: "The account ID"
        },
        date: {
          type: "string",
          description: "The transaction date in YYYY-MM-DD format"
        },
        amount: {
          type: "number",
          description: "The transaction amount in milliunits format (1000 milliunits = $1). Inflow (income) should be positive, outflow (expense) should be negative."
        },
        payee_id: {
          type: "string",
          description: "Optional: The payee ID"
        },
        payee_name: {
          type: "string",
          description: "Optional: The payee name (if payee_id is not provided)"
        },
        category_id: {
          type: "string",
          description: "Optional: The category ID"
        },
        memo: {
          type: "string",
          description: "Optional: A memo for the transaction"
        },
        cleared: {
          type: "string",
          description: "Optional: The cleared status",
          enum: ["cleared", "uncleared", "reconciled"]
        },
        approved: {
          type: "boolean",
          description: "Optional: Whether the transaction is approved (default: false)"
        },
        flag_color: {
          type: "string",
          description: "Optional: Flag color",
          enum: ["red", "orange", "yellow", "green", "blue", "purple"]
        }
      },
      required: ["budget_id", "account_id", "date", "amount"]
    }
  },
  {
    name: "update_transaction",
    description: "Update an existing transaction",
    inputSchema: {
      type: "object",
      properties: {
        budget_id: {
          type: "string",
          description: "The budget ID (use 'last-used' for the last used budget)"
        },
        transaction_id: {
          type: "string",
          description: "The transaction ID"
        },
        account_id: {
          type: "string",
          description: "Optional: The account ID"
        },
        date: {
          type: "string",
          description: "Optional: The transaction date in YYYY-MM-DD format"
        },
        amount: {
          type: "number",
          description: "Optional: The transaction amount in milliunits format (1000 milliunits = $1)"
        },
        payee_id: {
          type: "string",
          description: "Optional: The payee ID"
        },
        category_id: {
          type: "string",
          description: "Optional: The category ID"
        },
        memo: {
          type: "string",
          description: "Optional: A memo for the transaction"
        },
        cleared: {
          type: "string",
          description: "Optional: The cleared status",
          enum: ["cleared", "uncleared", "reconciled"]
        },
        approved: {
          type: "boolean",
          description: "Optional: Whether the transaction is approved"
        },
        flag_color: {
          type: "string",
          description: "Optional: Flag color (use null to remove flag)",
          enum: ["red", "orange", "yellow", "green", "blue", "purple", null]
        }
      },
      required: ["budget_id", "transaction_id"]
    }
  },
  {
    name: "delete_transaction",
    description: "Delete a transaction",
    inputSchema: {
      type: "object",
      properties: {
        budget_id: {
          type: "string",
          description: "The budget ID (use 'last-used' for the last used budget)"
        },
        transaction_id: {
          type: "string",
          description: "The transaction ID"
        }
      },
      required: ["budget_id", "transaction_id"]
    }
  },

  // ============================================================
  // Scheduled Transactions
  // ============================================================
  {
    name: "get_scheduled_transactions",
    description: "Get all scheduled transactions for a budget",
    inputSchema: {
      type: "object",
      properties: {
        budget_id: {
          type: "string",
          description: "The budget ID (use 'last-used' for the last used budget)"
        }
      },
      required: ["budget_id"]
    }
  },
  {
    name: "get_scheduled_transaction",
    description: "Get a specific scheduled transaction",
    inputSchema: {
      type: "object",
      properties: {
        budget_id: {
          type: "string",
          description: "The budget ID (use 'last-used' for the last used budget)"
        },
        scheduled_transaction_id: {
          type: "string",
          description: "The scheduled transaction ID"
        }
      },
      required: ["budget_id", "scheduled_transaction_id"]
    }
  },

  // ============================================================
  // Payees
  // ============================================================
  {
    name: "get_payees",
    description: "Get all payees for a budget",
    inputSchema: {
      type: "object",
      properties: {
        budget_id: {
          type: "string",
          description: "The budget ID (use 'last-used' for the last used budget)"
        }
      },
      required: ["budget_id"]
    }
  },
  {
    name: "get_payee",
    description: "Get a specific payee",
    inputSchema: {
      type: "object",
      properties: {
        budget_id: {
          type: "string",
          description: "The budget ID (use 'last-used' for the last used budget)"
        },
        payee_id: {
          type: "string",
          description: "The payee ID"
        }
      },
      required: ["budget_id", "payee_id"]
    }
  },

  // ============================================================
  // Months
  // ============================================================
  {
    name: "get_months",
    description: "Get all months for a budget",
    inputSchema: {
      type: "object",
      properties: {
        budget_id: {
          type: "string",
          description: "The budget ID (use 'last-used' for the last used budget)"
        }
      },
      required: ["budget_id"]
    }
  },
  {
    name: "get_month",
    description: "Get a specific month's budget data",
    inputSchema: {
      type: "object",
      properties: {
        budget_id: {
          type: "string",
          description: "The budget ID (use 'last-used' for the last used budget)"
        },
        month: {
          type: "string",
          description: "The month in ISO format (YYYY-MM-DD), e.g., '2025-01-01' for January 2025, or use 'current' for the current month"
        }
      },
      required: ["budget_id", "month"]
    }
  }
];
