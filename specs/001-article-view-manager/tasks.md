# Tasks: Sino Trade Article View Manager

**Input**: Design documents from `/specs/001-article-view-manager/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included per Constitution Principle III (Testing Discipline). TDD approach for business logic.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Next.js App Router structure:
- **Pages**: `app/` directory
- **Components**: `components/` at repository root
- **Business logic**: `lib/` at repository root
- **Hooks**: `hooks/` at repository root
- **Tests**: `__tests__/` mirroring source structure

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Verify Next.js 16.0.1, React 19.2.0, and TailwindCSS 4.x are installed in package.json
- [x] T002 [P] Create directory structure: components/, components/ui/, lib/, lib/utils/, hooks/, __tests__/
- [x] T003 [P] Configure Jest for Next.js with path aliases (@/) in jest.config.js
- [x] T004 [P] Install Playwright and configure for mobile testing (iOS Safari, Chrome) in playwright.config.ts
- [x] T005 [P] Verify tsconfig.json has strict mode enabled and "paths" configured for @/* aliases
- [x] T006 [P] Configure Tailwind mobile-first breakpoints (sm:640px, md:768px, lg:1024px) in tailwind.config.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create TypeScript types in lib/types.ts (Article, ArticleChannel, BoostOperation, BoostStatus, ActivityLogEntry, LogType)
- [x] T008 [P] Create constants in lib/constants.ts (CHANNELS config with channelIds, defaultCount, defaultInterval for 深談總經 and 股市熱話)
- [x] T009 [P] Implement URL builder utility in lib/utils/urlBuilder.ts (sanitize title, construct Sino Trade article URL)
- [x] T010 [P] Implement User-Agent randomization in lib/utils/userAgents.ts (array of 10-15 mobile/desktop UA strings)
- [x] T011 [P] Implement precision timer utility in lib/utils/timing.ts (setTimeout with drift compensation for <5% variance)
- [x] T012 Create GraphQL API proxy route in app/api/articles/route.ts (POST handler, fetch from Sino Trade API, error handling)
- [x] T013 [P] Implement article service in lib/articleService.ts (fetchArticlesByChannel with retry logic)
- [x] T014 Implement boost service core logic in lib/boostService.ts (timing, request execution, User-Agent randomization)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Select and Boost Article Views (Priority: P1) 🎯 MVP

**Goal**: Enable users to select an article from a searchable dropdown and initiate automated view boosting with configurable parameters.

**Independent Test**: Select article from dropdown, set count/interval, click "開始執行", verify requests sent to correct URL with proper timing (manual test or E2E).

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T015 [P] [US1] Unit test for URL builder in __tests__/lib/urlBuilder.test.ts (test Chinese chars, special chars, double-dash separator)
- [x] T016 [P] [US1] Unit test for boost service in __tests__/lib/boostService.test.ts (test timing accuracy, request execution, state management)
- [x] T017 [P] [US1] Unit test for article service in __tests__/lib/articleService.test.ts (mock fetch, test retry logic, error handling)

### Implementation for User Story 1

- [x] T018 [P] [US1] Create useArticles hook in hooks/useArticles.ts (fetch articles by channel, filter by search term, error handling)
- [x] T019 [P] [US1] Create useBoostOperation hook in hooks/useBoostOperation.ts (useReducer for state machine: idle→running→completed)
- [x] T020 [P] [US1] Create Button component in components/ui/Button.tsx (variants: primary, secondary, disabled; min 44px touch target)
- [x] T021 [P] [US1] Create Input component in components/ui/Input.tsx (number input with validation, error display)
- [x] T022 [P] [US1] Create Select component in components/ui/Select.tsx (searchable dropdown with keyboard navigation, ARIA labels)
- [x] T023 [US1] Create TabSelector component in components/TabSelector.tsx (toggle between 深談總經 and 股市熱話, active state styling)
- [x] T024 [US1] Create ArticleSelector component in components/ArticleSelector.tsx (uses Select, integrates useArticles hook, auto-focus on tab change)
- [x] T025 [US1] Create BoostControls component in components/BoostControls.tsx (form inputs for count/interval, validation, start button)
- [x] T026 [US1] Integrate components in app/page.tsx (compose TabSelector, ArticleSelector, BoostControls; wire up state)
- [x] T027 [US1] Implement form validation in BoostControls (count 1-10000, interval ≥300ms, show error messages)
- [x] T028 [US1] Implement channel-specific defaults (200 for 深談總經, 2000 for 股市熱話, 300ms interval)
- [x] T029 [US1] Implement auto-focus behavior using useAutoFocus hook in hooks/useAutoFocus.ts (focus dropdown on tab change)
- [x] T030 [US1] Add mobile-first responsive styling (TailwindCSS classes, test at 320px, 375px, 428px widths)

### Component Tests for User Story 1

- [x] T031 [P] [US1] Component test for TabSelector in __tests__/components/TabSelector.test.tsx (test tab switching, active state)
- [x] T032 [P] [US1] Component test for ArticleSelector in __tests__/components/ArticleSelector.test.tsx (test dropdown open, search filter, selection)
- [x] T033 [P] [US1] Component test for BoostControls in __tests__/components/BoostControls.test.tsx (test validation, form submission, disabled states)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. User can select article and start boost operation.

---

## Phase 4: User Story 2 - Monitor View Boosting Progress (Priority: P2)

**Goal**: Provide real-time feedback on boost operation progress with stats, progress bar, and activity log.

**Independent Test**: Start boost operation, verify progress bar updates, stats increment, activity log shows timestamped entries.

### Tests for User Story 2

- [ ] T034 [P] [US2] Unit test for progress calculations (percentage, average response time) in __tests__/lib/boostService.test.ts (extend existing file)

### Implementation for User Story 2

- [ ] T035 [P] [US2] Create ProgressBar component in components/ui/ProgressBar.tsx (animated width transition, percentage display)
- [ ] T036 [P] [US2] Create ProgressMonitor component in components/ProgressMonitor.tsx (progress bar, stats grid, activity log, auto-scroll to view)
- [ ] T037 [US2] Extend useBoostOperation hook to track metrics (current, success, failed, responseTimes, averageResponseTime)
- [ ] T038 [US2] Implement real-time progress updates in ProgressMonitor (subscribe to boost operation state changes)
- [ ] T039 [US2] Implement stats grid (4 stat cards: 進行中, 成功, 失敗, 平均回應時間)
- [ ] T040 [US2] Implement activity log (timestamped entries, color-coded by type: info/success/error, limit 50 entries)
- [ ] T041 [US2] Implement auto-scroll to ProgressMonitor when operation starts (using ref and scrollIntoView)
- [ ] T042 [US2] Add activity log entries for key events (operation start, every 10 requests, errors, completion)
- [ ] T043 [US2] Integrate ProgressMonitor into app/page.tsx (show/hide based on operation status)
- [ ] T044 [US2] Add ARIA live region for progress updates (accessibility for screen readers)

### Component Tests for User Story 2

- [ ] T045 [P] [US2] Component test for ProgressBar in __tests__/components/ui/ProgressBar.test.tsx (test width updates, percentage display)
- [ ] T046 [P] [US2] Component test for ProgressMonitor in __tests__/components/ProgressMonitor.test.tsx (test stats updates, activity log entries)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. User can boost articles and monitor progress.

---

## Phase 5: User Story 3 - Control Ongoing Operations (Priority: P3)

**Goal**: Allow users to pause, resume, or restart boost operations for flexible control.

**Independent Test**: Start boost, click pause (verify stops), click resume (verify continues), click restart (verify resets).

### Tests for User Story 3

- [ ] T047 [P] [US3] Unit test for pause/resume timing in __tests__/lib/boostService.test.ts (verify elapsed time excludes paused duration)

### Implementation for User Story 3

- [ ] T048 [US3] Extend useBoostOperation hook with pause/resume/reset actions (update state machine transitions)
- [ ] T049 [US3] Add pause tracking to timing state (pausedDuration calculation, exclude from total duration)
- [ ] T050 [US3] Add control buttons to BoostControls (暫停/繼續 toggle button, 重新開始 button)
- [ ] T051 [US3] Implement pause logic in boost service (clear setTimeout, preserve current state)
- [ ] T052 [US3] Implement resume logic in boost service (continue from current index, recalculate next tick time)
- [ ] T053 [US3] Implement reset logic (stop operation, reset all counters, clear activity log, re-enable form)
- [ ] T054 [US3] Update button states based on operation status (idle: show "開始執行", running: show "暫停", paused: show "繼續")
- [ ] T055 [US3] Add confirmation or warning when user changes form values while paused
- [ ] T056 [US3] Implement Page Visibility API detection (auto-pause when tab hidden, show toast notification)

### Component Tests for User Story 3

- [ ] T057 [P] [US3] Component test for control buttons in __tests__/components/BoostControls.test.tsx (extend existing, test pause/resume/reset)

**Checkpoint**: All user stories should now be independently functional. Full feature set complete.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final quality assurance

- [ ] T058 [P] Add loading skeleton for ArticleSelector while fetching articles
- [ ] T059 [P] Add error toast notifications for API failures (create toast utility in lib/utils/toast.ts)
- [ ] T060 [P] Optimize bundle size (dynamic import ProgressMonitor, check with @next/bundle-analyzer)
- [ ] T061 [P] Add metadata and SEO tags in app/layout.tsx (title, description, OG tags)
- [ ] T062 [P] Create custom 404 and error pages (app/not-found.tsx, app/error.tsx)
- [ ] T063 Implement edge case handling (GraphQL API errors, network failures, empty article lists)
- [ ] T064 Add input debouncing for article search (300ms delay in ArticleSelector)
- [ ] T065 Verify mobile responsiveness on real devices (iPhone SE, Pixel 5)
- [ ] T066 Run Lighthouse audit (verify FCP <1.8s, LCP <2.5s, bundle <200KB)
- [ ] T067 Verify WCAG 2.1 AA compliance (contrast ratios, keyboard navigation, ARIA labels)
- [ ] T068 Add JSDoc comments to all exported functions/components
- [ ] T069 Run ESLint and fix all warnings (ensure zero warnings per Constitution)
- [ ] T070 Run TypeScript type check with --noEmit (ensure no type errors)

---

## Phase 7: End-to-End Testing

**Purpose**: Validate critical user journeys work end-to-end

- [ ] T071 [P] E2E test for User Story 1 in __tests__/e2e/boost-workflow.spec.ts (select article, configure params, start boost, verify requests sent)
- [ ] T072 [P] E2E test for User Story 2 (extend above test, verify progress updates, stats increment)
- [ ] T073 [P] E2E test for User Story 3 (test pause, resume, restart operations)
- [ ] T074 [P] E2E test for mobile viewport (run tests with Mobile Safari device emulation)
- [ ] T075 Run full E2E suite on CI (verify all tests pass)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (Phase 3): No dependencies on other stories - can start after Phase 2
  - User Story 2 (Phase 4): Depends on User Story 1 (uses BoostControls, extends useBoostOperation)
  - User Story 3 (Phase 5): Depends on User Story 1 (extends BoostControls and useBoostOperation)
- **Polish (Phase 6)**: Depends on all desired user stories being complete
- **E2E Testing (Phase 7)**: Depends on Polish phase completion

### User Story Dependencies

- **User Story 1 (P1)**: Independent - can be fully implemented and tested after Foundational phase
- **User Story 2 (P2)**: Extends US1 components but is independently testable (can verify progress updates work)
- **User Story 3 (P3)**: Extends US1 components but is independently testable (can verify pause/resume works)

### Within Each User Story

**User Story 1**:
1. Tests (T015-T017) can run in parallel - write these FIRST
2. Hooks and utils (T018-T019, T029) can run in parallel
3. UI components (T020-T022) can run in parallel (base components)
4. Feature components (T023-T025) depend on base components
5. Integration (T026) depends on all components
6. Final touches (T027-T030) depend on integration
7. Component tests (T031-T033) can run in parallel

**User Story 2**:
1. Test (T034) first
2. Components (T035-T036) can run in parallel
3. Hook extension (T037) and integration (T038-T044) sequential
4. Component tests (T045-T046) can run in parallel

**User Story 3**:
1. Test (T047) first
2. Implementation (T048-T056) mostly sequential (state machine changes)
3. Component test (T057) after implementation

### Parallel Opportunities

**Phase 2 (Foundational)**: All tasks T007-T014 can run in parallel (different files, no dependencies)

**Phase 3 (User Story 1)**:
- Tests T015-T017 can run together
- Hooks T018-T019, utility T029 can run together
- Base UI components T020-T022 can run together
- Component tests T031-T033 can run together

**Phase 4 (User Story 2)**:
- Components T035-T036 can run together
- Component tests T045-T046 can run together

**Phase 6 (Polish)**: Tasks T058-T062, T068-T070 can run in parallel

**Phase 7 (E2E)**: All tests T071-T074 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all unit tests for User Story 1 together:
Task T015: "Unit test for URL builder in __tests__/lib/urlBuilder.test.ts"
Task T016: "Unit test for boost service in __tests__/lib/boostService.test.ts"
Task T017: "Unit test for article service in __tests__/lib/articleService.test.ts"

# Launch all base UI components for User Story 1 together:
Task T020: "Create Button component in components/ui/Button.tsx"
Task T021: "Create Input component in components/ui/Input.tsx"
Task T022: "Create Select component in components/ui/Select.tsx"

# Launch all component tests for User Story 1 together:
Task T031: "Component test for TabSelector in __tests__/components/TabSelector.test.tsx"
Task T032: "Component test for ArticleSelector in __tests__/components/ArticleSelector.test.tsx"
Task T033: "Component test for BoostControls in __tests__/components/BoostControls.test.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T014) - CRITICAL - blocks all stories
3. Complete Phase 3: User Story 1 (T015-T033)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Select article from dropdown
   - Configure count and interval
   - Start boost operation
   - Verify requests sent to correct URL
   - Verify timing accuracy (<5% variance)
5. Deploy/demo if ready - **This is your MVP!**

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (T015-T033) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (T034-T046) → Test independently (verify progress updates) → Deploy/Demo
4. Add User Story 3 (T047-T057) → Test independently (verify pause/resume) → Deploy/Demo
5. Add Polish (T058-T070) → Final quality pass → Deploy/Demo
6. Add E2E tests (T071-T075) → Full regression suite → Production ready

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T014)
2. Once Foundational is done (T014 complete):
   - **Developer A**: User Story 1 (T015-T033) - Core boosting
   - **Developer B**: User Story 2 (T034-T046) - Progress monitoring (can start base components while A works)
   - **Developer C**: User Story 3 (T047-T057) - Control features (can plan/write tests while A works)
3. Stories integrate cleanly (US2 and US3 extend US1 components)
4. Polish (T058-T070) can be divided among team

Note: US2 and US3 should wait for US1 to reach T026 (integration complete) before starting their integration work, but can work on tests and base components in parallel.

---

## Task Count Summary

- **Total Tasks**: 75
- **Phase 1 (Setup)**: 6 tasks
- **Phase 2 (Foundational)**: 8 tasks (BLOCKING)
- **Phase 3 (User Story 1)**: 19 tasks (tests: 6, implementation: 13)
- **Phase 4 (User Story 2)**: 13 tasks (tests: 3, implementation: 10)
- **Phase 5 (User Story 3)**: 10 tasks (tests: 2, implementation: 8)
- **Phase 6 (Polish)**: 13 tasks
- **Phase 7 (E2E Testing)**: 5 tasks

**Parallelizable Tasks**: 32 tasks marked with [P] (43% can run in parallel)

**MVP Scope (User Story 1 only)**: 33 tasks (T001-T033)
**Full Feature Set (All 3 stories)**: 62 tasks (T001-T057)
**Production Ready (Including polish & E2E)**: 75 tasks (T001-T075)

---

## Notes

- [P] tasks = different files, no dependencies - can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable per spec requirements
- Tests written FIRST before implementation (TDD approach per Constitution Principle III)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Bundle size check at T066 - if >200KB, stop and optimize before continuing
- Mobile testing at T065 - verify on real devices, not just emulator
- Constitution compliance verified at T067-T070 before declaring feature complete
