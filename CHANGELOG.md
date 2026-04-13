# Changelog


## [2026.4.13+1] - 2026-04-13

### Chore
- *(deps)* Bump EndBug/add-and-commit from 9 to 10
- *(deps)* Bump 1password/load-secrets-action from 3 to 4
- *(deps)* Bump slackapi/slack-github-action from 2.1.1 to 3.0.1

## [2026.3.25+1] - 2026-03-25

### 🔧 Miscellaneous
- Pull in customer id from Shop Api

## [2026.3.23+3] - 2026-03-23

## [2026.3.23+2] - 2026-03-23

## [2026.3.23+1] - 2026-03-23

### 🐛 Fixed
- Update release configuration to use token

## [2026.3.19+1] - 2026-03-19

### 🚀 Added
- A no redirect option to existing calls

## [2026.3.12+4] - 2026-03-12

### Chore
- *(deps)* Bump actions/checkout from 5 to 6
- *(deps)* Bump orhun/git-cliff-action from 4.6.0 to 4.7.1
- *(deps)* Bump actions/setup-node from 5 to 6

## [2026.3.12+3] - 2026-03-12

### 🔧 Miscellaneous
- Skip changelog on dependabot

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

