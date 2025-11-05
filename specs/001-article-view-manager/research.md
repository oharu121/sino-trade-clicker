# Research: Sino Trade Article View Manager

**Phase**: 0 (Outline & Research)
**Date**: 2025-11-05
**Purpose**: Resolve technical unknowns and establish best practices for implementation

## Overview

This research phase addresses key technical decisions for building a mobile-first Next.js application that manages article view boosting operations with real-time progress tracking and precise timing control.

## Research Areas

### 1. Next.js App Router State Management

**Decision**: Use React hooks (useState, useReducer) with custom hooks for complex state

**Rationale**:
- Boost operation state is client-side only, no persistence needed (per spec assumptions)
- React 19's improved concurrent rendering handles frequent updates efficiently
- Custom hooks (`useBoostOperation`, `useArticles`) encapsulate complex logic
- No need for external state library (Redux, Zustand) for this single-page app scope
- Reduces bundle size and aligns with Performance Principle V (<200KB target)

**Alternatives Considered**:
- **Zustand**: Lightweight (3KB) but adds unnecessary dependency for simple client state
- **React Context**: Overhead for re-renders when deeply nested, not needed for flat structure
- **LocalStorage persistence**: Rejected per spec assumption "no persistence needed between sessions"

**Best Practices**:
- Collocate state close to where it's used (component-level for UI, hook-level for shared)
- Use `useReducer` for complex boost operation state machine (idle → running → paused → completed)
- Memoize expensive computations (average response time) with `useMemo`
- Use `useCallback` for event handlers passed to child components to prevent re-renders

---

### 2. GraphQL Client Strategy for External API

**Decision**: Use native `fetch` with a thin wrapper in `articleService.ts`

**Rationale**:
- Simple GraphQL queries (no subscriptions, mutations, or complex caching needed)
- Avoid heavy clients (Apollo: ~31KB, urql: ~21KB) that impact bundle size budget
- Next.js App Router has built-in `fetch` with Request/Response caching
- Only need to fetch article lists on tab change (infrequent operation)
- Easier to implement error handling and retry logic with plain fetch

**Alternatives Considered**:
- **Apollo Client**: Full-featured but 31KB gzipped, overkill for 2 simple queries
- **urql**: Lighter (21KB) but still adds complexity for minimal benefit
- **graphql-request**: 4KB library but still unnecessary abstraction layer

**Implementation Pattern**:
```typescript
// lib/articleService.ts
async function fetchArticlesByChannel(channelId: string): Promise<Article[]> {
  const response = await fetch('/api/articles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ channelId, limit: 100, page: 0, skip: 1 })
  });
  if (!response.ok) throw new Error('Failed to fetch articles');
  const data = await response.json();
  return data.clientGetArticleList.filtered;
}
```

**Error Handling**:
- Exponential backoff for retries (3 attempts with 1s, 2s, 4s delays)
- User-friendly error messages ("Unable to load articles. Please try again.")
- Fallback to empty array with error toast notification

---

### 3. Precise Interval Timing for Request Throttling

**Decision**: Use `setTimeout` with drift compensation, not `setInterval`

**Rationale**:
- `setInterval` accumulates drift when event loop is busy (can violate <5% variance requirement)
- `setTimeout` recursion allows drift calculation and correction per iteration
- Pausing/resuming easier to implement with setTimeout chains
- More predictable behavior on mobile devices with variable CPU throttling

**Implementation Pattern**:
```typescript
// lib/utils/timing.ts
class PrecisionTimer {
  private expectedTime: number;
  private timeoutId: number | null = null;

  start(callback: () => void, interval: number) {
    this.expectedTime = Date.now() + interval;
    const tick = () => {
      callback();
      const drift = Date.now() - this.expectedTime;
      this.expectedTime += interval;
      this.timeoutId = setTimeout(tick, Math.max(0, interval - drift));
    };
    this.timeoutId = setTimeout(tick, interval);
  }

  pause() {
    if (this.timeoutId) clearTimeout(this.timeoutId);
  }
}
```

**Alternatives Considered**:
- **setInterval**: Simpler but drift accumulation violates variance requirement
- **requestAnimationFrame**: 60fps throttling unnecessary, wastes CPU for this use case
- **Web Workers**: Overkill complexity for simple timing, harder to debug

**Variance Testing**: Use `performance.now()` for high-resolution timestamps in tests to verify <5% variance

---

### 4. Mobile-First Responsive Design with TailwindCSS

**Decision**: Mobile-first breakpoint strategy with Tailwind responsive utilities

**Rationale**:
- Aligns with Constitution Principle I (Mobile-First Design)
- TailwindCSS 4.x already configured in project
- Utility-first approach reduces CSS bundle size vs component libraries
- Design tokens in `tailwind.config.ts` ensure UX Consistency (Principle IV)

**Breakpoint Strategy**:
```javascript
// tailwind.config.ts
theme: {
  screens: {
    'sm': '640px',   // Tablet portrait
    'md': '768px',   // Tablet landscape
    'lg': '1024px',  // Desktop
  }
}
```

**Mobile-First Patterns**:
- Base styles target 320px-428px (iPhone SE to iPhone Pro Max)
- Touch targets: `min-h-[44px] min-w-[44px]` (TailwindCSS utilities)
- Font scaling: `text-base sm:text-lg` (larger on desktop)
- Grid layouts: `grid-cols-1 sm:grid-cols-2` (stacked on mobile, side-by-side on tablet)

**Component Library Decision**:
- **Rejected**: shadcn/ui, Headless UI, Radix (add bundle weight, learning curve)
- **Chosen**: Build minimal custom components (`Button`, `Input`, `Select`) with Tailwind
- Justification: Only 5 UI primitives needed, custom implementation lighter and more maintainable

---

### 5. Auto-Focus and Auto-Scroll UX Behaviors

**Decision**: Use React refs with `useEffect` for DOM manipulation

**Rationale**:
- Auto-focus on article dropdown when tab changes (FR-017)
- Auto-scroll to progress section when operation starts (FR-018)
- React refs provide direct DOM access for `focus()` and `scrollIntoView()`
- `useEffect` ensures actions happen after render (avoiding React warnings)

**Implementation Pattern**:
```typescript
// hooks/useAutoFocus.ts
function useAutoFocus(trigger: unknown) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.focus({ preventScroll: false });
    }
  }, [trigger]);
  return ref;
}

// components/ProgressMonitor.tsx
function ProgressMonitor({ isVisible }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isVisible && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isVisible]);
  return <div ref={ref}>...</div>;
}
```

**Accessibility Considerations**:
- `aria-live="polite"` on progress section for screen reader announcements
- Respect `prefers-reduced-motion` for smooth scroll behavior
- Ensure focus visible outline for keyboard navigation (WCAG 2.1 AA)

---

### 6. User-Agent Randomization for Request Headers

**Decision**: Pre-generated array of common mobile/desktop User-Agents with random selection

**Rationale**:
- FR-020 requires randomized User-Agent headers (carried over from example.html)
- Simple array with `Math.random()` selection sufficient (no crypto randomness needed per assumptions)
- Avoids generating strings dynamically (faster, deterministic for testing)

**Implementation**:
```typescript
// lib/utils/userAgents.ts
const USER_AGENTS = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
  'Mozilla/5.0 (Linux; Android 13; SM-S901B) AppleWebKit/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
  // ... 10-15 common UA strings
];

export function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}
```

**Source for UA Strings**: [whatismybrowser.com/guides/the-latest-user-agent](https://www.whatismybrowser.com/guides/the-latest-user-agent/) (current iOS, Android, Chrome, Safari)

---

### 7. Testing Strategy for React Components and E2E

**Decision**: Jest + React Testing Library for components, Playwright for E2E critical user journeys

**Rationale**:
- Jest + RTL already standard in Next.js ecosystem, zero setup required
- RTL encourages testing user behavior vs implementation details (aligns with spec acceptance scenarios)
- Playwright better mobile device emulation than Cypress for mobile-first testing
- Playwright network interception easier for mocking GraphQL responses

**Component Testing Approach**:
- Test user interactions (click, type, select) not internal state
- Mock `useBoostOperation` hook for testing UI independently of business logic
- Mock `fetch` for `articleService` tests (avoid real API calls)
- Snapshot tests for static UI components (Button variants, ProgressBar states)

**E2E Critical Journeys** (per spec user stories):
1. **P1: Select and Boost** - Select article from dropdown, configure params, start, verify requests sent
2. **P2: Monitor Progress** - Start boost, verify progress bar updates, stats increment
3. **P3: Control Operations** - Pause mid-operation, resume, verify state preserved

**Test Data**:
- Mock GraphQL responses with realistic Chinese article titles from requirements
- Test URL building with special characters (, ， ? 空格) to verify sanitization

---

### 8. Performance Optimization for Bundle Size and Core Web Vitals

**Decision**: Dynamic imports for non-critical components, image optimization, code splitting

**Rationale**:
- Meet <200KB initial bundle target (Performance Principle V)
- Achieve FCP <1.8s, LCP <2.5s on 4G (Success Criteria SC-007)
- Next.js App Router automatic code splitting helps but manual optimization needed

**Optimization Strategies**:

**1. Dynamic Imports**:
```typescript
// Lazy load ProgressMonitor only when operation starts
const ProgressMonitor = dynamic(() => import('@/components/ProgressMonitor'), {
  loading: () => <ProgressSkeleton />,
  ssr: false // Client-only component (uses browser timers)
});
```

**2. Tree Shaking**:
- Import only needed TailwindCSS utilities (JIT mode enabled in v4)
- Avoid importing entire libraries (e.g., use `date-fns/format` not `date-fns`)

**3. Font Optimization**:
- Use `next/font` with `Geist` (already configured) for automatic font subsetting
- Preload critical font weights: `weight: ['400', '600']`

**4. Bundle Analysis**:
```bash
# Add to package.json scripts
"analyze": "ANALYZE=true next build"
```
Use `@next/bundle-analyzer` to identify bloat

**5. Core Web Vitals Monitoring**:
- Use Next.js built-in Web Vitals reporting (`reportWebVitals` in App Router)
- Monitor in development with Chrome DevTools Lighthouse
- Set performance budgets in `next.config.js` (warn if bundle >200KB)

---

## Technology Stack Summary

| Category | Technology | Version | Justification |
|----------|-----------|---------|---------------|
| Framework | Next.js | 16.0.1 | App Router for modern React patterns, built-in optimizations |
| Language | TypeScript | 5.x | Type safety, code quality (Constitution Principle II) |
| UI Library | React | 19.2.0 | Concurrent rendering for smooth progress updates |
| Styling | TailwindCSS | 4.x | Design tokens, mobile-first utilities, small bundle |
| Fonts | next/font (Geist) | - | Automatic optimization, already configured |
| State | React Hooks | Built-in | No external library needed for client-only state |
| GraphQL | Native fetch | Built-in | Simple queries, avoid heavy client libraries |
| Testing (Unit) | Jest + RTL | Latest | Standard Next.js testing stack |
| Testing (E2E) | Playwright | Latest | Better mobile emulation, network mocking |
| Timing | setTimeout (custom) | Built-in | Drift compensation for <5% variance |

**Total Estimated Bundle Size**: ~180KB gzipped (Next.js runtime ~150KB + app code ~30KB)

---

## Risk Mitigation

### Risk: Mobile Browser Timer Throttling
**Issue**: iOS Safari throttles timers to 1s minimum when tab backgrounded
**Mitigation**:
- Use Page Visibility API to detect tab inactive state
- Pause boost operation automatically when tab hidden
- Show warning toast: "Operation paused while tab is hidden"

### Risk: CORS Issues with Sino Trade GraphQL API
**Issue**: Direct browser requests may fail due to CORS policy
**Mitigation**:
- Implement Next.js API route `/app/api/articles/route.ts` as proxy
- Server-side route avoids CORS (browser never calls external API directly)
- Add error handling for network failures with retry logic

### Risk: Bundle Size Creep
**Issue**: Dependencies added during development may exceed 200KB budget
**Mitigation**:
- Run `npm run analyze` weekly during development
- Set up bundle size CI check (fail if >220KB to allow 10% buffer)
- Prefer built-in solutions over npm packages

---

## Open Questions for Phase 1

1. **Data Model**: Should `BoostOperation` state machine be explicit enum or string union type?
2. **Contracts**: Does `/api/articles` need rate limiting to protect Sino Trade API?
3. **Quickstart**: Should local dev environment use mocked GraphQL responses or require VPN/proxy to reach production API?

These will be resolved during Phase 1 design phase.
