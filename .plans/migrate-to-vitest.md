# Plan: Migrate from Jest to Vitest

## Summary
Migrate the test framework from Jest 30.x to Vitest for this Next.js 16 + React 19 project. The project has 8 test files using Jest + React Testing Library with 80% coverage thresholds.

## Current State
- **Framework**: Jest 30.2.0 with `next/jest`
- **Test files**: 8 files in `__tests__/` (5 component tests, 3 service tests)
- **Dependencies**: jest, jest-environment-jsdom, @types/jest, @testing-library/*
- **Config files**: `jest.config.js`, `jest.setup.js`
- **Coverage**: 80% threshold for branches, functions, lines, statements

## Implementation Steps

### 1. Install Vitest dependencies
```bash
npm install -D vitest @vitejs/plugin-react jsdom @vitest/coverage-v8
```

### 2. Create vitest.config.ts
Create configuration with:
- React plugin for JSX/TSX support
- jsdom environment for DOM testing
- Path alias `@/` mapped to project root
- Coverage settings matching current 80% thresholds
- Setup file reference

### 3. Create vitest.setup.ts
Replace `jest.setup.js` with TypeScript equivalent:
- Import `@testing-library/jest-dom/vitest`

### 4. Update package.json scripts
Replace Jest scripts with Vitest equivalents:
- `"test": "vitest run"`
- `"test:watch": "vitest"`
- `"test:coverage": "vitest run --coverage"`

### 5. Update test files (8 files)
For each test file, replace Jest globals with Vitest imports:
- Add `import { describe, it, expect, beforeEach, vi } from 'vitest'`
- Replace `jest.fn()` → `vi.fn()`
- Replace `jest.mock()` → `vi.mock()`
- Replace `jest.clearAllMocks()` → `vi.clearAllMocks()`
- Replace `(global.fetch as jest.Mock)` → `(global.fetch as ReturnType<typeof vi.fn>)`

Files to update:
- `__tests__/components/ArticleSelector.test.tsx`
- `__tests__/components/BoostControls.test.tsx`
- `__tests__/components/ProgressMonitor.test.tsx`
- `__tests__/components/TabSelector.test.tsx`
- `__tests__/components/ui/ProgressBar.test.tsx`
- `__tests__/lib/articleService.test.ts`
- `__tests__/lib/boostService.test.ts`
- `__tests__/lib/urlBuilder.test.ts`

### 6. Remove Jest dependencies and config
- Delete `jest.config.js`
- Delete `jest.setup.js`
- Remove from package.json: `jest`, `jest-environment-jsdom`, `@types/jest`

### 7. Update CLAUDE.md
Update the commands section to reflect Vitest usage.

## Files to Modify
- `package.json` - Update dependencies and scripts
- `vitest.config.ts` - Create new config
- `vitest.setup.ts` - Create new setup file
- `__tests__/**/*.test.{ts,tsx}` - Update 8 test files
- `jest.config.js` - Delete
- `jest.setup.js` - Delete
- `CLAUDE.md` - Update test command reference

## Verification
1. Run `npm install` to install new dependencies
2. Run `npm test` to verify all 8 tests pass
3. Run `npm run test:coverage` to verify coverage reporting works
4. Verify coverage thresholds are enforced (80% minimum)
