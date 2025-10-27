# YNAB MCPB - Claude Desktop Extension

A comprehensive Claude Desktop Extension that provides seamless integration with YNAB (You Need A Budget), enabling you to manage your complete budgeting workflow directly from Claude conversations using the YNAB API.

## Quick Start

### Installation

1. **Download** the `ynab-mcpb.mcpb` file
2. **Install** in Claude Desktop (Settings → Extensions → Install Extension)
3. **Get YNAB API Token** from [YNAB Developer Settings](https://app.ynab.com/settings/developer)
4. **Configure Token** in Claude Desktop:
   - Go to Settings → MCP Servers
   - Find "ynab-mcpb" in the list
   - Click the settings/edit icon
   - Add your API token in the environment variables:
   ```json
   {
     "env": {
       "YNAB_API_TOKEN": "your-api-token-here"
     }
   }
   ```
5. **Restart Claude Desktop** to apply changes
6. **Start using** YNAB tools in your conversations!

> **💡 Pro Tip**: Use `'last-used'` as the budget_id to access your most recently used budget.

## Features

### 🎯 Core Functionality
- **Complete Budget Management**: View and manage all your budgets
- **Account Operations**: Access all accounts, create new ones, and view balances
- **Category Management**: View categories, set budgeted amounts, and track spending
- **Transaction Management**: Create, read, update, and delete transactions
- **Advanced Filtering**: Filter transactions by account, category, payee, or date range

### 🔍 Discovery & Navigation
- **Payee Management**: View all payees and their transaction history
- **Scheduled Transactions**: Access and review recurring transactions
- **Monthly Budgets**: View budget snapshots for any month
- **Multi-Budget Support**: Work with multiple budgets seamlessly

### 🛠️ Advanced Features
- **Flexible Updates**: Modify transactions and category budgets with full parameter control
- **Data Integrity**: Comprehensive input validation and error handling
- **Security**: Secure API token authentication
- **Cross-Platform**: Works on macOS, Linux, and Windows

## API Reference

### 📊 Budgets

#### `get_budgets` - Get all budgets
**Parameters**: None

#### `get_budget` - Get budget details
**Required**: `budget_id` (use `'last-used'` for most recent)

#### `get_budget_settings` - Get budget settings
**Required**: `budget_id`

### 💰 Accounts

#### `get_accounts` - Get all accounts
**Required**: `budget_id`

#### `get_account` - Get specific account
**Required**: `budget_id`, `account_id`

#### `create_account` - Create new account
**Required**: `budget_id`, `name`, `type`, `balance`
**Types**: `checking`, `savings`, `creditCard`, `cash`, `lineOfCredit`, `otherAsset`, `otherLiability`, `mortgage`, `autoLoan`, `studentLoan`, `personalLoan`, `medicalDebt`, `otherDebt`

### 📁 Categories

#### `get_categories` - Get all categories
**Required**: `budget_id`

#### `get_category` - Get specific category
**Required**: `budget_id`, `category_id`

#### `get_category_for_month` - Get category for specific month
**Required**: `budget_id`, `month` (YYYY-MM-DD), `category_id`

#### `update_category_for_month` - Update category budget
**Required**: `budget_id`, `month` (YYYY-MM-DD), `category_id`, `budgeted` (in milliunits)

### 💳 Transactions

#### `get_transactions` - Get all transactions
**Required**: `budget_id`
**Optional**: `since_date` (YYYY-MM-DD), `type` (uncategorized, unapproved)

#### `get_transaction` - Get specific transaction
**Required**: `budget_id`, `transaction_id`

#### `get_transactions_by_account` - Get transactions for account
**Required**: `budget_id`, `account_id`
**Optional**: `since_date`

#### `get_transactions_by_category` - Get transactions for category
**Required**: `budget_id`, `category_id`
**Optional**: `since_date`

#### `get_transactions_by_payee` - Get transactions for payee
**Required**: `budget_id`, `payee_id`
**Optional**: `since_date`

#### `create_transaction` - Create new transaction
**Required**: `budget_id`, `account_id`, `date` (YYYY-MM-DD), `amount` (in milliunits)
**Optional**: `payee_id`, `payee_name`, `category_id`, `memo`, `cleared`, `approved`, `flag_color`

#### `update_transaction` - Update transaction
**Required**: `budget_id`, `transaction_id`
**Optional**: `account_id`, `date`, `amount`, `payee_id`, `category_id`, `memo`, `cleared`, `approved`, `flag_color`

#### `delete_transaction` - Delete transaction
**Required**: `budget_id`, `transaction_id`

### 🔄 Scheduled Transactions

#### `get_scheduled_transactions` - Get all scheduled transactions
**Required**: `budget_id`

#### `get_scheduled_transaction` - Get specific scheduled transaction
**Required**: `budget_id`, `scheduled_transaction_id`

### 👥 Payees

#### `get_payees` - Get all payees
**Required**: `budget_id`

#### `get_payee` - Get specific payee
**Required**: `budget_id`, `payee_id`

### 📅 Months

#### `get_months` - Get all months
**Required**: `budget_id`

#### `get_month` - Get specific month
**Required**: `budget_id`, `month` (YYYY-MM-DD or `'current'`)

## Usage Examples

### Budget Overview
```
Show me an overview of my current budget, including all categories and how much I've budgeted vs. spent
```

### Transaction Management
```
Create a transaction for $45.32 at Whole Foods in my checking account, categorized as Groceries, dated today
```

### Spending Analysis
```
Show me all my dining out transactions from the past 30 days and calculate how much I've spent
```

### Category Management
```
Set my Groceries category budget to $500 for this month
```

### Account Balances
```
What are the balances of all my accounts?
```

### Monthly Review
```
Show me my budget for this month and highlight any categories where I'm overspending
```

## Important Concepts

### Milliunits
YNAB API uses "milliunits" for all currency amounts:
- **1000 milliunits = $1.00**
- Example: $45.32 = 45,320 milliunits
- Inflow (income) = positive values
- Outflow (expenses) = negative values

### Budget ID
- Use `'last-used'` to automatically use your most recently accessed budget
- Or provide the specific budget ID from `get_budgets`

### Date Format
- All dates use ISO format: `YYYY-MM-DD`
- Example: `'2025-01-15'` for January 15, 2025
- For months: Use the first day of the month (e.g., `'2025-01-01'` for January 2025)

### Transaction Status
- **cleared**: `cleared`, `uncleared`, `reconciled`
- **approved**: `true` or `false` (default: `false` for new transactions)
- **flag_color**: `red`, `orange`, `yellow`, `green`, `blue`, `purple`, or `null`

## Requirements

- **Node.js**: Version 18.0.0 or higher
- **YNAB Account**: Active YNAB subscription
- **YNAB API Token**: Personal Access Token from [YNAB Developer Settings](https://app.ynab.com/settings/developer)
- **Claude Desktop**: Compatible with MCPB specification
- **Internet Connection**: Required for API access

## Installation

```bash
# Clone or download the extension
cd ynab-mcpb

# Install dependencies
npm install

# Validate the code
npm run validate

# Package the extension
npm run package

# Install in Claude Desktop (follow Claude Desktop docs)
```

## Configuration

### Setting Your API Token

**Option 1: Environment Variable**
```bash
export YNAB_API_TOKEN="your-personal-access-token"
```

**Option 2: .mcp.json Configuration**
Edit `.mcp.json` and replace `your-api-token-here` with your actual token:
```json
{
  "mcpServers": {
    "ynab-mcpb": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/ynab-mcpb/server/index.js"],
      "env": {
        "YNAB_API_TOKEN": "your-personal-access-token"
      }
    }
  }
}
```

### Getting Your API Token
1. Visit [YNAB Developer Settings](https://app.ynab.com/settings/developer)
2. Click "New Token"
3. Give it a name (e.g., "Claude Desktop")
4. Copy the generated token
5. Add it to your configuration

## Architecture

### Project Structure
```
ynab-mcpb/
├── manifest.json              # MCPB extension manifest
├── package.json               # Dependencies and scripts
├── README.md                  # Documentation
├── .mcp.json                  # MCP configuration
├── .gitignore                # Git ignore rules
└── server/
    ├── index.js               # Main MCP server
    ├── tool-definitions.js    # MCP tool schemas
    ├── ynab-client.js         # YNAB API client
    ├── server-config.js       # Configuration constants
    └── utils.js               # Utilities and helpers
```

### Key Design Principles
- **Separation of Concerns**: Modular architecture with clear responsibilities
- **Security First**: Secure API token handling and HTTPS communication
- **User-Friendly**: Intuitive parameter names and helpful error messages
- **Robust Error Handling**: Comprehensive error catching and reporting
- **Cross-Platform**: Works on all major operating systems
- **Extensible**: Easy to add new tools and functionality
- **Modern JavaScript**: ES6 modules with async/await

## Security Features

- **API Token Security**: Token stored in environment variables, never in code
- **HTTPS Communication**: All API requests use secure HTTPS
- **Input Validation**: All parameters validated for type and format
- **Error Handling**: Structured error responses with detailed logging
- **Timeout Management**: Prevents hanging API requests (30s default)
- **Rate Limiting**: Respects YNAB API rate limits (200 requests/hour)

## Development

### Running in Development Mode
```bash
# Enable debug logging
DEBUG=true npm start

# Or use the dev script
npm run dev
```

### Validating Code
```bash
npm run validate
```

### Testing the Extension
```bash
# Start the server
npm start

# The server will listen on stdio for MCP requests
```

## Troubleshooting

### Common Issues

**API Token Not Set**
```
Error: YNAB_API_TOKEN environment variable is required
Solution: Set the YNAB_API_TOKEN environment variable or add it to .mcp.json
```

**Invalid API Token**
```
Error: YNAB API error (401): Unauthorized
Solution: Verify your API token is correct at https://app.ynab.com/settings/developer
```

**Rate Limit Exceeded**
```
Error: YNAB API error (429): Too Many Requests
Solution: Wait a few minutes. YNAB allows 200 requests per hour per token.
```

**Network Errors**
```
Error: YNAB API request failed
Solution: Check your internet connection and verify YNAB service status
```

### Debug Information
```bash
# Enable detailed logging
DEBUG=true npm start
```

### Getting Help

- **YNAB API Issues**: Check [YNAB API Documentation](https://api.ynab.com/)
- **Claude Desktop**: Follow Claude Desktop documentation
- **Extension Issues**: Create issue in project repository

## API Rate Limits

- **Limit**: 200 requests per hour per access token
- **Recommendation**: Use delta requests when possible to reduce API calls
- **Best Practice**: Cache frequently accessed data

## License

MIT License - See package.json for details

## Acknowledgments

- **YNAB** for their excellent API and budgeting platform
- **Anthropic** for the Model Context Protocol (MCP) SDK
- **Community** for feedback and contributions

---

*Built with ❤️ for the Claude Desktop ecosystem*
