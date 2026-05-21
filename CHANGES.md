# Changelog

## [Unreleased]

### ✨ Changed
- Migrated from React to Preact, updated babel, eslint, and jest configs accordingly
- Replaced individual component files (Badge, Button, Grid, Link, etc.) with a single dynamic `Generator` that renders any Shopify UI Web component
- Simplified `UptickFlow` down to a thin wrapper around Generator
- Removed legacy v1 components (`OfferBadges`, `OfferButtons`, `OfferImageWrapper`, etc.)
- Removed utility helpers that are no longer needed (`formatAttributes`, `offers`)

### 🐛 Fixed
- Prevent infinite redirect loops and catch silent failures in offer fetching

### 🔧 Miscellaneous
- Dependency cleanup — added missing `@babel/core` and `babel-jest`, removed unused `deepmerge`
- Improved test coverage and enabled Jest coverage thresholds
