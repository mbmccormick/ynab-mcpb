/**
 * YNAB MCP Server Configuration
 */

export const SERVER_CONFIG = {
  name: "ynab-mcpb",
  version: "1.0.0",
  capabilities: {
    tools: {},
  },
  api: {
    baseUrl: "https://api.ynab.com/v1",
    timeout: 30000,
    maxRetries: 3,
  }
};
