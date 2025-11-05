# Implementation Plan: Sino Trade Article View Manager

**Branch**: `001-article-view-manager` | **Date**: 2025-11-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-article-view-manager/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a mobile-first web application that allows content managers to boost article view counts for Sino Trade articles. The application features a tabbed interface for two article channels (深談總經 and 股市熱話), searchable article selection via GraphQL API integration, configurable boost parameters, real-time progress monitoring, and operation control (pause/resume/restart). Implementation uses Next.js App Router with TailwindCSS for styling, prioritizing mobile UX with auto-focus, auto-scroll, and accessible touch targets.

## Technical Context

**Language/Version**: TypeScript 5.x with Next.js 16.0.1 (App Router)
**Primary Dependencies**: React 19.2.0, TailwindCSS 4.x, next/font (Geist)
**Storage**: Client-side state only (no persistence required per spec assumptions)
**Testing**: Jest + React Testing Library for components, Playwright for E2E critical user journeys
**Target Platform**: Modern web browsers (Chrome, Safari, Firefox) on mobile (iOS 15+, Android 10+) and desktop
**Project Type**: Web application (Next.js single-page app with App Router)
**Performance Goals**: FCP <1.8s, LCP <2.5s, TTI <3.5s on 4G mobile; <200KB initial JS bundle (gzipped)
**Constraints**: Minimum 300ms request interval (per spec), <5% timing variance, 44x44px minimum touch targets
**Scale/Scope**: Single-user tool, ~2 screens (main form + progress view), support for 10,000 requests per operation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Mobile-First Design ✅
- [x] Mobile viewport (320px-428px) design priority established in spec (FR-016)
- [x] Touch targets minimum 44x44px specified (SC-004)
- [x] Mobile-specific UX features: auto-focus, auto-scroll (FR-017, FR-018)
- [x] Performance budgets prioritize 4G mobile (SC-007, Performance Goals)
- [x] Responsive approach confirmed: mobile → tablet → desktop breakpoints

### II. Code Quality Standards ✅
- [x] TypeScript strict mode enabled in existing tsconfig.json
- [x] ESLint configured in package.json (eslint-config-next)
- [x] All new code will use TypeScript with strict typing (no `any`)
- [x] Component/function complexity kept under control with modular design
- [x] JSDoc comments required for all exports

### III. Testing Discipline ✅
- [x] Testing strategy defined: Jest + RTL for components, Playwright for E2E
- [x] 80% coverage target for new code
- [x] Critical user journeys identified in spec (3 user stories with acceptance scenarios)
- [x] Test-first approach for boost operation logic (state management, timing)

### IV. User Experience Consistency ✅
- [x] TailwindCSS design system for consistent styling
- [x] Shared component patterns (tabs, dropdown, progress, buttons)
- [x] Design tokens via Tailwind config (colors, spacing, typography)
- [x] Accessible button colors and distinct states (FR-019)
- [x] Loading states for async operations (GraphQL fetch, progress updates)
- [x] WCAG 2.1 AA compliance: semantic HTML, ARIA labels, keyboard navigation

### V. Performance Requirements ✅
- [x] Performance goals defined: FCP <1.8s, LCP <2.5s, TTI <3.5s on 4G
- [x] Bundle size target: <200KB initial (gzipped)
- [x] Progress updates <100ms response (SC-003)
- [x] Request interval timing <5% variance (SC-010)
- [x] Optimized for 4G mobile network conditions

**Gate Status**: ✅ **PASS** - All constitution principles satisfied. No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/
├── page.tsx                    # Main application page (article view manager UI)
├── layout.tsx                  # Root layout (existing)
├── globals.css                 # Global styles with Tailwind directives (existing)
└── api/
    └── articles/
        └── route.ts            # API route for GraphQL proxy to Sino Trade API

components/
├── ArticleSelector.tsx         # Searchable dropdown for article selection
├── TabSelector.tsx             # Tab switcher for 深談總經 / 股市熱話
├── BoostControls.tsx           # Form inputs (count, interval) + control buttons
├── ProgressMonitor.tsx         # Progress bar, stats grid, activity log
└── ui/
    ├── Button.tsx              # Reusable button component with variants
    ├── Input.tsx               # Form input with validation
    ├── ProgressBar.tsx         # Animated progress bar component
    └── Select.tsx              # Searchable select/dropdown component

lib/
├── types.ts                    # TypeScript interfaces (Article, Channel, BoostOperation)
├── constants.ts                # Channel configs, default values, API endpoints
├── articleService.ts           # GraphQL client logic for fetching articles
├── boostService.ts             # Core boost operation logic (timing, requests)
└── utils/
    ├── urlBuilder.ts           # Article URL construction with title sanitization
    ├── userAgents.ts           # User-Agent randomization
    └── timing.ts               # Precise interval timing utilities

hooks/
├── useArticles.ts              # Hook for fetching/filtering articles by channel
├── useBoostOperation.ts        # Hook for boost state management (start/pause/resume)
└── useAutoFocus.ts             # Hook for auto-focus behavior on tab change

__tests__/
├── components/
│   ├── ArticleSelector.test.tsx
│   ├── BoostControls.test.tsx
│   └── ProgressMonitor.test.tsx
├── lib/
│   ├── boostService.test.ts
│   └── urlBuilder.test.ts
└── e2e/
    └── boost-workflow.spec.ts  # Playwright E2E for critical user journeys

public/
└── (existing static assets)
```

**Structure Decision**: Next.js App Router structure with `/app` directory for pages and API routes. Components organized by feature (article selection, boost controls, progress monitoring) with shared UI primitives in `/components/ui`. Business logic in `/lib` separates concerns (article fetching, boost execution, URL building). Custom React hooks in `/hooks` for state management and UX behaviors. Tests mirror source structure for easy navigation.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No complexity violations. All architecture decisions align with constitution principles.
