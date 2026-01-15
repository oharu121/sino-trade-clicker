# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.1] - 2026-01-16

### Fixed

- Fixed article selector dropdown appearing behind the Boost Controls panel due to z-index stacking context issue
- Added cursor-pointer to all interactive elements (buttons, tabs, dropdowns) for consistent UX feedback
- Fixed outdated test assertions for ProgressMonitor and TabSelector components

## [1.0.0] - 2026-01-11

### Changed

- **Migrated test framework from Jest to Vitest** - Replaced Jest 30.x with Vitest for faster test execution and better ESM support
  - Added `vitest.config.ts` with React plugin, jsdom environment, and path aliases
  - Created `vitest.setup.ts` with proper test cleanup
  - Updated all 8 test files to use Vitest imports (`vi.fn()`, `vi.mock()`, etc.)
  - Maintained 80% coverage thresholds

- **Updated Tailwind CSS to v4 canonical classes** - Migrated gradient classes from `bg-gradient-to-*` to `bg-linear-to-*` syntax
  - Updated `ProgressBar`, `ProgressMonitor`, and other components
  - Added `eslint-plugin-tailwind-canonical-classes` for linting
  - Added `prettier-plugin-tailwindcss` for class sorting

### Fixed

- Fixed `baseline-browser-mapping` outdated data warning by updating the package
- Fixed ESLint unused variable warnings in test files and components
- Fixed TypeScript errors in test mocks (missing `consecutiveFailures`, `responseTimes`, `pausedDuration` properties)
- Fixed lint script in package.json (`eslint . --fix` instead of `eslint -- --fix`)

### Removed

- Removed Jest configuration files (`jest.config.js`, `jest.setup.js`)
- Removed Jest dependencies (`jest`, `jest-environment-jsdom`, `@types/jest`)
- Cleaned up old spec and requirement documentation files

### Dependencies

- Added: `vitest`, `@vitejs/plugin-react`, `@vitest/coverage-v8`, `jsdom`
- Added: `eslint-plugin-tailwind-canonical-classes`, `prettier-plugin-tailwindcss`
- Removed: `jest`, `jest-environment-jsdom`, `@types/jest`
- Updated: `baseline-browser-mapping` to latest version

## [0.1.0] - 2024-12-22

### Added

- Initial release with article view boosting functionality
- Tab-based channel selection (深談總經, 川普專題, etc.)
- Article search and selection with view counts
- Configurable boost parameters (count, interval)
- Real-time progress monitoring with activity log
- Pause/Resume/Cancel operation controls
- Auto-stop on consecutive failures (3x threshold)
- Backend proxy to bypass CORS restrictions
- Random User-Agent rotation for requests
