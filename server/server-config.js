/**
 * YNAB MCP Server Configuration
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get package.json version dynamically
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));

export const SERVER_CONFIG = {
  name: "ynab-mcpb",
  version: packageJson.version,
  capabilities: {
    tools: {},
  },
  api: {
    baseUrl: "https://api.ynab.com/v1",
    timeout: 30000,
    maxRetries: 3,
  }
};
