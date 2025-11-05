# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-01-05

### Added
- Added `InputValidator` class for robust input validation
- Tool metadata annotations (`readOnlyHint`, `destructiveHint`) for MCP Directory compliance
- `MilliunitConverter` class for better code organization

### Changed
- **BREAKING**: Upgraded manifest schema from 0.2 to 0.3
- Updated to latest `@anthropic-ai/mcpb` package (2.0.1)
- Refactored server configuration to dynamically read version from package.json
- Improved logger consistency - removed inconsistent JSON.stringify usage
- Refactored currency conversion functions into `MilliunitConverter` class

### Fixed
- Consistent logging behavior across all log levels
- Server configuration version now auto-syncs with package.json
- Better code organization and maintainability

## [1.0.0] - 2024-10-27

### Added
- Initial release
- YNAB API integration
- 24 tools for complete budget management
- Support for budgets, accounts, categories, transactions, and payees
- Response formatters to handle large datasets efficiently
