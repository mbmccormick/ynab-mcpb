# CLAUDE.md - AI Assistant Guide for YNAB MCPB

This document provides context and guidance for AI assistants working on the YNAB MCPB (Model Context Protocol Bundle) extension for Claude Desktop.

## Project Overview

**Purpose**: A Claude Desktop extension that provides seamless integration with the You Need A Budget (YNAB) API, enabling budget management directly from Claude conversations.

**Type**: MCPB extension using Model Context Protocol (MCP)
**Platform**: Cross-platform (macOS, Linux, Windows)
**Language**: JavaScript (ES6 modules)
**API**: YNAB REST API v1

## Architecture

### High-Level Design

```
Claude Desktop
    ↓ (MCP over stdio)
server/index.js (MCP Server)
    ↓
server/ynab-client.js (HTTP Client)
    ↓ (HTTPS + Bearer Token)
YNAB REST API
```

### Key Design Patterns

1. **Lazy Initialization**: The YNAB client is initialized only when first tool is called, not in constructor. This allows the server to start successfully even without an API token configured.

2. **Response Formatting**: All large responses go through formatters in `server/response-formatter.js` to prevent 1MB tool result limits and reduce token usage.

3. **Modular Architecture**: Clear separation of concerns across files:
   - `index.js`: MCP protocol handling and routing
   - `ynab-client.js`: API communication
   - `tool-definitions.js`: Tool schemas
   - `response-formatter.js`: Data optimization
   - `utils.js`: Shared utilities

## File Structure

```
ynab-mcpb/
├── manifest.json              # MCPB extension manifest (critical: user_config section)
├── package.json               # Dependencies and scripts
├── README.md                  # User documentation
├── CLAUDE.md                  # This file - AI assistant guide
├── LICENSE                    # MIT License
├── icon.png                   # YNAB logo (234KB PNG)
├── .gitignore                # Git ignore rules
├── .mcp.json                  # MCP configuration (local dev only)
└── server/
    ├── index.js               # Main MCP server (9.5KB)
    ├── tool-definitions.js    # 24 MCP tool schemas (15KB)
    ├── ynab-client.js         # YNAB API client (8.4KB)
    ├── response-formatter.js  # Response optimization (7.3KB)
    ├── server-config.js       # Configuration constants (0.5KB)
    └── utils.js               # Utilities and helpers (2.6KB)
```

## Critical Technical Concepts

### 1. Milliunits

YNAB uses "milliunits" for all currency amounts:
- **1000 milliunits = $1.00**
- Example: $45.32 = 45,320 milliunits
- Positive = inflow (income)
- Negative = outflow (expenses)

**Always use `MilliunitConverter` utilities** from `utils.js`:
```javascript
import { MilliunitConverter } from './utils.js';

// Converting to milliunits
const milliunits = MilliunitConverter.toMilliunits(45.32); // 45320

// Formatting for display
const formatted = MilliunitConverter.formatCurrency(45320); // "$45.32"
```

### 2. User Configuration (API Token)

The YNAB API token is configured via `user_config` in `manifest.json`:

```json
"user_config": {
  "YNAB_API_TOKEN": {
    "type": "string",
    "sensitive": true,
    "required": true
  }
}
```

Claude Desktop automatically:
- Prompts user for token during installation
- Injects it as environment variable: `process.env.YNAB_API_TOKEN`
- Stores it securely (never in code or logs)

**Important**: Use `${user_config.YNAB_API_TOKEN}` syntax in manifest, not `${YNAB_API_TOKEN}`.

### 3. Response Formatters

**Critical for preventing errors**: Raw YNAB API responses can be massive (18MB+). Always use formatters for large responses.

Example:
```javascript
// BAD - Returns 18MB of data
case "get_budget":
  return await client.getBudget(args.budget_id);

// GOOD - Returns ~1KB summary
case "get_budget":
  const result = await client.getBudget(args.budget_id);
  return formatBudget(result);
```

**When to use formatters**:
- `get_budget` → `formatBudget()` (18MB → 1KB)
- `get_accounts` → `formatAccounts()` (20KB → 5KB)
- `get_categories` → `formatCategories()` (100KB → 10KB)
- `get_month` → `formatMonth()` (200KB → 20KB)
- `get_transactions` → `formatTransactions()` (limits to 50)
- `get_payees` → `formatPayees()` (limits to 100)
- `get_scheduled_transactions` → `formatScheduledTransactions()` (limits to 50)

### 4. Lazy Client Initialization

The YNAB client must not be initialized in constructor:

```javascript
// server/index.js
class YnabServer {
  constructor() {
    this.ynabClient = null; // Don't initialize here
  }

  getYnabClient() {
    if (!this.ynabClient) {
      const apiToken = process.env.YNAB_API_TOKEN;
      if (!apiToken) {
        throw new McpError(...); // Friendly error message
      }
      this.ynabClient = new YnabClient(apiToken);
    }
    return this.ynabClient;
  }
}
```

**Why**: Allows server to start successfully without token, enabling proper error handling when tools are actually called.

## Common Development Tasks

### Adding a New Tool

1. **Add tool definition** in `server/tool-definitions.js`:
```javascript
{
  name: "new_tool_name",
  description: "Clear description of what this tool does",
  inputSchema: {
    type: "object",
    properties: {
      budget_id: {
        type: "string",
        description: "Budget ID (use 'last-used' for most recent)"
      },
      // ... other parameters
    },
    required: ["budget_id"]
  }
}
```

2. **Add API method** in `server/ynab-client.js`:
```javascript
async newApiMethod(budgetId, params = {}) {
  return await this.request('GET', `/budgets/${budgetId}/endpoint`, params);
}
```

3. **Add route handler** in `server/index.js`:
```javascript
case "new_tool_name":
  const result = await client.newApiMethod(args.budget_id, args);
  return formatResult(result); // If response is large
```

4. **Add formatter** (if needed) in `server/response-formatter.js`:
```javascript
export function formatResult(data) {
  return {
    summary: { /* key metrics */ },
    items: data.items.slice(0, 50).map(item => ({
      id: item.id,
      name: item.name,
      // ... essential fields only
    })),
    note: "Limited to 50 items. Full data omitted for performance."
  };
}
```

5. **Update manifest.json** tools array:
```json
{
  "name": "new_tool_name",
  "description": "Clear description"
}
```

### Testing Changes

```bash
# Validate syntax
npm run validate

# Test with real API (requires YNAB_API_TOKEN)
export YNAB_API_TOKEN="your-token"
node test/test-validation.js

# Test error handling
node test/test-error-handling.js

# Package for distribution
npm run package
```

### Building and Packaging

```bash
# Install dependencies
npm install

# Validate code
npm run validate

# Package extension
npm run package
# Creates ynab-mcpb.mcpb file
```

## YNAB API Specifics

### Authentication
- **Method**: Bearer token in Authorization header
- **Format**: `Authorization: Bearer YOUR_TOKEN`
- **Rate Limit**: 200 requests/hour per token

### Common Patterns

**Budget ID**:
- Use `'last-used'` to automatically select most recent budget
- Otherwise use UUID from `get_budgets`

**Dates**:
- Format: ISO 8601 (`YYYY-MM-DD`)
- Example: `'2025-01-15'`
- For months: Use first day (`'2025-01-01'` for January)
- Validate with `ParameterProcessor.validateDate()`

**Transaction Status**:
- `cleared`: `'cleared'`, `'uncleared'`, `'reconciled'`
- `approved`: `true` or `false` (default: `false`)
- `flag_color`: `'red'`, `'orange'`, `'yellow'`, `'green'`, `'blue'`, `'purple'`, or `null`

### Error Handling

```javascript
try {
  const response = await fetch(url, options);

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Invalid API token');
    }
    if (response.status === 429) {
      throw new Error('Rate limit exceeded (200/hour)');
    }
    // ... other status codes
  }

  return await response.json();
} catch (error) {
  YnabLogger.error('API request failed', { error: error.message });
  throw error;
}
```

## Important Constraints

### Size Limits
- **Tool Result**: 1MB maximum
- **Conversation**: Token limits apply
- **Solution**: Use response formatters, limit results

### Security
- **Never log API tokens**
- **Never commit tokens to git**
- **Use `sensitive: true` in manifest for secrets**
- **API token in environment variable only**

### Cross-Platform
- **Use `fetch` API** (not Node.js-specific HTTP)
- **ES6 modules** (`import`/`export`, not `require`)
- **No platform-specific code** (works on macOS, Linux, Windows)

### MCPB Manifest
- **Version**: `0.2` (manifest_version)
- **Sensitive config**: Use `"sensitive": true`, not `"secret"`
- **Env substitution**: `${user_config.VARNAME}`, not `${VARNAME}`
- **Icon**: PNG format, reasonable size (<500KB)

## Code Conventions

### Import Style
```javascript
// ES6 modules
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { formatBudget } from "./response-formatter.js";
```

### Error Messages
- Clear, actionable messages
- Include links to documentation when relevant
- Example: "Get your personal access token from https://app.ynab.com/settings/developer"

### Logging
```javascript
import { YnabLogger } from './utils.js';

YnabLogger.info("Server started");
YnabLogger.debug("Processing request", { args });
YnabLogger.error("Request failed", { error: error.message });
```

### Parameter Processing
```javascript
import { ParameterProcessor } from './utils.js';

const processedArgs = ParameterProcessor.process(args);
// Validates dates, handles optional params, normalizes input
```

## Testing Guidelines

### Validation Tests
- Test all read endpoints with real API
- Verify response structure
- Check formatters work correctly
- Located in `test/test-validation.js`

### Error Handling Tests
- Test invalid inputs
- Test missing required parameters
- Test date validation edge cases
- Located in `test/test-error-handling.js`

### Manual Testing
1. Install in Claude Desktop
2. Test common workflows:
   - "Show my budget overview"
   - "What are my account balances?"
   - "Show recent transactions"
   - "Create a transaction for $50 at Starbucks"

## Troubleshooting

### "Tool result is too large"
- **Cause**: Response exceeds 1MB
- **Solution**: Add/use response formatter
- **Check**: `server/response-formatter.js`

### "YNAB_API_TOKEN not set"
- **Cause**: Missing user_config in manifest or incorrect syntax
- **Solution**: Verify manifest.json has proper user_config section
- **Syntax**: `${user_config.YNAB_API_TOKEN}`

### "Invalid API token"
- **Cause**: Token expired or incorrect
- **Solution**: User needs to generate new token at https://app.ynab.com/settings/developer

### "Rate limit exceeded"
- **Cause**: >200 requests/hour
- **Solution**: Wait, or optimize to make fewer API calls

## Release Process

1. **Update version** in `package.json` and `manifest.json`
2. **Update README.md** with any new features
3. **Run validation**: `npm run validate`
4. **Test thoroughly** with real YNAB API
5. **Commit changes**: Clear, descriptive message
6. **Create git tag**: `git tag v1.x.x`
7. **Push**: `git push && git push --tags`
8. **Build package**: `npm run package`
9. **Create GitHub release** with:
   - Tag (e.g., `v1.0.0`)
   - Release notes (features, fixes, changes)
   - Attach `ynab-mcpb.mcpb` file

## Resources

- **YNAB API Docs**: https://api.ynab.com/
- **MCP SDK Docs**: https://github.com/modelcontextprotocol/sdk
- **MCPB Manifest Spec**: https://github.com/anthropics/mcpb/blob/main/MANIFEST.md
- **Project Repository**: https://github.com/mbmccormick/ynab-mcpb
- **Issues**: https://github.com/mbmccormick/ynab-mcpb/issues

## Quick Reference

### File Purposes
- `manifest.json` → Extension metadata, user config, tool list
- `server/index.js` → MCP server, request routing
- `server/ynab-client.js` → YNAB API HTTP client
- `server/tool-definitions.js` → Tool schemas for MCP
- `server/response-formatter.js` → Size optimization
- `server/utils.js` → Logging, validation, formatting
- `server/server-config.js` → Constants

### Key Functions
- `getYnabClient()` → Lazy client initialization
- `executeTool()` → Route tool requests to API
- `ParameterProcessor.process()` → Validate/normalize input
- `MilliunitConverter.formatCurrency()` → Format for display
- `YnabLogger.*()` → Structured logging

### Environment Variables
- `YNAB_API_TOKEN` → User's personal access token (required)
- `DEBUG` → Enable debug logging (optional)

---

**Last Updated**: 2025-10-27
**Extension Version**: 1.0.0
**MCP SDK Version**: 1.20.1
