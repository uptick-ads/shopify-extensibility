# Changelog


## [2026.3.12+2] - 2026-03-12

### 🚀 Added
- Dependabot workflow checks

## [2026.3.12+1] - 2026-03-12

### 🔧 Miscellaneous
- Bring CI config up to date

## [2026.3.5+1] - 2026-03-05

### 🔧 Miscellaneous
- Summarizing Change Log

## [2026.3.4+3] - 2026-03-04

### 🐛 Fixed
- Changelog generation now runs only for internal branches.

## [2026.3.4+2] - 2026-03-04

### ✨ Changed
- Internal release metadata update.

## [2026.3.4+1] - 2026-03-04

### 🚀 Added
- New `UptickFlow` component with loading and next-offer progression support.
- Unified offer-rendering component architecture.
- API client constructor options and release/changelog notification support.

### 🐛 Fixed
- Flow requests now pass referer and include required API context.
- Offer retrieval flow uses GET for next-offer requests.

### ✨ Changed
- Flow now supports dynamic `integrationId` and additional shop parameters.
- API payloads now include versioning and `confirmation_number` tracking.
- Offer links support accept and reject actions.
- Extraction package simplified and migrated away from git submodule component imports.
- Upgraded to Shopify UI Extensions `2025-07` and refreshed lint/test tooling.

### 🧪 Testing
- Expanded API test coverage for the new flow behavior.

## [0.0.0] - 2025-01-15

### ✨ Changed
- Initial commit.

