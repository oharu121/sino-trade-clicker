# Quickstart Guide: Sino Trade Article View Manager

**Feature**: Article View Boost Tool
**Branch**: `001-article-view-manager`
**Last Updated**: 2025-11-05

---

## Prerequisites

- Node.js 20+ installed
- npm or yarn package manager
- Git (for version control)
- Modern browser (Chrome, Safari, Firefox - latest version)
- Optional: Mobile device or emulator for mobile testing

---

## Setup

### 1. Install Dependencies

```bash
# Navigate to project root
cd f:\repository\sino-trade-clicker

# Install packages (if not already installed)
npm install

# Verify Next.js version
npm list next  # Should show 16.0.1
```

### 2. Verify Existing Configuration

The project already has TailwindCSS and TypeScript configured. Verify:

**Check `tsconfig.json`** - Strict mode should be enabled:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    // ...
  }
}
```

**Check `tailwind.config.ts`** - Mobile-first breakpoints:
```typescript
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    screens: {
      'sm': '640px',   // Tablet portrait
      'md': '768px',   // Tablet landscape
      'lg': '1024px',  // Desktop
    },
    // ... design tokens
  }
}
```

### 3. Install Additional Development Dependencies

```bash
# Testing libraries
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event
npm install --save-dev @playwright/test

# Type definitions
npm install --save-dev @types/jest

# Optional: Bundle analyzer
npm install --save-dev @next/bundle-analyzer
```

### 4. Create Feature Branch (if not already on it)

```bash
git checkout 001-article-view-manager
```

---

## Development Workflow

### 1. Start Development Server

```bash
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

### 2. File Structure Overview

After implementing the feature, your structure should match:

```
app/
├── page.tsx                 # Main UI (START HERE)
├── api/articles/route.ts    # GraphQL proxy

components/
├── ArticleSelector.tsx      # Searchable dropdown
├── TabSelector.tsx          # Channel tabs
├── BoostControls.tsx        # Form + buttons
├── ProgressMonitor.tsx      # Progress display
└── ui/                      # Shared components

lib/
├── types.ts                 # TypeScript interfaces
├── constants.ts             # Channel configs
├── articleService.ts        # API client
├── boostService.ts          # Core logic
└── utils/                   # Helpers

hooks/
├── useArticles.ts           # Article fetching
├── useBoostOperation.ts     # State management
└── useAutoFocus.ts          # UX behaviors
```

### 3. Development Steps

**Phase 1: Setup Foundation**
1. Create `lib/types.ts` with all interfaces (see `data-model.md`)
2. Create `lib/constants.ts` with channel configurations
3. Create API route `app/api/articles/route.ts` (see `contracts/api-articles.md`)
4. Test API route: `curl -X POST http://localhost:3000/api/articles -H "Content-Type: application/json" -d '{"channelId":"6514f8b3b13f2760605fcef1","limit":10,"page":0,"skip":1}'`

**Phase 2: Core Services**
5. Implement `lib/utils/urlBuilder.ts` (title sanitization)
6. Implement `lib/utils/userAgents.ts` (random UA selection)
7. Implement `lib/articleService.ts` (GraphQL client)
8. Implement `lib/boostService.ts` (request timing logic)
9. Write unit tests for utilities and services

**Phase 3: State Management**
10. Implement `hooks/useBoostOperation.ts` (reducer for boost state)
11. Implement `hooks/useArticles.ts` (article fetching + filtering)
12. Implement `hooks/useAutoFocus.ts` (UX behaviors)
13. Write tests for hooks (using `@testing-library/react-hooks`)

**Phase 4: UI Components**
14. Create `components/ui/Button.tsx` (with mobile touch targets)
15. Create `components/ui/Input.tsx` (with validation)
16. Create `components/ui/Select.tsx` (searchable dropdown)
17. Create `components/ui/ProgressBar.tsx` (animated bar)
18. Create `components/TabSelector.tsx`
19. Create `components/ArticleSelector.tsx`
20. Create `components/BoostControls.tsx`
21. Create `components/ProgressMonitor.tsx`
22. Write component tests (Jest + RTL)

**Phase 5: Main Page Integration**
23. Update `app/page.tsx` to compose all components
24. Implement responsive layout (mobile-first)
25. Add auto-focus and auto-scroll behaviors
26. Test on mobile viewport (DevTools responsive mode)

**Phase 6: E2E Testing**
27. Write Playwright E2E tests for critical user journeys
28. Run full test suite: `npm test`
29. Verify mobile responsiveness on real device

---

## Testing

### Run Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Coverage should be ≥80% per Constitution Principle III
```

### Run E2E Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npx playwright test

# Run in UI mode (interactive)
npx playwright test --ui

# Run on specific device
npx playwright test --project="Mobile Safari"
```

### Manual Testing Checklist

**Mobile (iPhone SE 375px width)**:
- [ ] Tabs are touch-friendly (44x44px minimum)
- [ ] Dropdown opens with one tap
- [ ] Form inputs are easy to type in
- [ ] Progress bar visible without scrolling
- [ ] Activity log scrolls smoothly

**Desktop (1920x1080)**:
- [ ] Layout adapts to wider screen
- [ ] Touch targets still work with mouse
- [ ] No horizontal scroll

**Critical User Journeys**:
- [ ] **P1**: Select article, configure params, start boost, verify requests sent
- [ ] **P2**: Monitor progress updates in real-time
- [ ] **P3**: Pause operation, resume, verify state preserved

---

## Build & Performance

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

### Bundle Analysis

```bash
# Analyze bundle size
npm run analyze

# Check performance budgets
# - Initial bundle: <200KB gzipped ✅
# - First Load JS: <300KB ✅
```

### Performance Testing

**Lighthouse Audit** (in Chrome DevTools):
```bash
# Run Lighthouse on http://localhost:3000
# Mobile throttled (4G)
# - Performance score: >90
# - FCP: <1.8s
# - LCP: <2.5s
# - TTI: <3.5s
# - CLS: <0.1
```

---

## Troubleshooting

### Issue: CORS Error When Fetching Articles

**Symptom**: Console error `Access to fetch blocked by CORS policy`

**Solution**: The Next.js API route (`/api/articles`) proxies requests server-side. Ensure you're calling `/api/articles` not the Sino Trade API directly.

```typescript
// ❌ Wrong - direct call causes CORS
fetch('https://www.sinotrade.com.tw/richclub/api/graphql', ...)

// ✅ Correct - proxy via Next.js API route
fetch('/api/articles', ...)
```

---

### Issue: Timers Pause When Tab Backgrounded (iOS Safari)

**Symptom**: Boost operation pauses when switching tabs on mobile

**Solution**: This is expected behavior. Use Page Visibility API to detect and notify user:

```typescript
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden && boostState.status === 'running') {
      toast.warning('操作已暫停（分頁不在前景）');
      dispatch({ type: 'PAUSE' });
    }
  };
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, [boostState.status]);
```

---

### Issue: Bundle Size Exceeds 200KB

**Symptom**: Build warning `Bundle size exceeded 200KB`

**Solutions**:
1. **Dynamic imports**: Lazy load ProgressMonitor component
   ```typescript
   const ProgressMonitor = dynamic(() => import('@/components/ProgressMonitor'), { ssr: false });
   ```

2. **Tree shaking**: Import only needed utilities
   ```typescript
   // ❌ Imports entire library
   import _ from 'lodash';

   // ✅ Imports only needed function
   import debounce from 'lodash/debounce';
   ```

3. **Remove unused dependencies**: Check with `npm ls` and remove unused packages

4. **Analyze bundle**: `npm run analyze` to identify heavy imports

---

### Issue: Tests Fail with "Cannot find module '@/lib/types'"

**Symptom**: Jest can't resolve path aliases (`@/`)

**Solution**: Configure Jest path mapping in `jest.config.js`:

```javascript
module.exports = {
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  // ...
};
```

---

## Environment Variables

**Not required for this feature** - all configuration is hardcoded in `lib/constants.ts` (channel IDs, API endpoint).

If deploying to production with different API endpoints:

```bash
# Create .env.local
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://www.sinotrade.com.tw/richclub/api/graphql
```

Then use in `app/api/articles/route.ts`:
```typescript
const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;
```

---

## Mobile Testing

### Using Chrome DevTools (Desktop)

1. Open DevTools (F12)
2. Click "Toggle device toolbar" (Ctrl+Shift+M)
3. Select device: "iPhone SE" or custom 375px width
4. Test touch interactions and scrolling

### Using Real Device

**iOS (iPhone)**:
1. Connect iPhone to Mac via USB
2. Enable "Web Inspector" in Settings > Safari > Advanced
3. Open Safari on Mac, go to Develop > [Your iPhone] > localhost
4. Interact with app on phone, inspect in Safari DevTools

**Android**:
1. Enable "Developer Options" and "USB Debugging"
2. Connect to computer, open Chrome on desktop
3. Go to `chrome://inspect#devices`
4. Click "Inspect" on localhost session
5. Interact with app on phone, inspect in Chrome DevTools

### Using Emulators

**iOS Simulator** (macOS):
```bash
# Open in Safari on iOS Simulator
npx playwright test --project="Mobile Safari" --headed
```

**Android Emulator**:
```bash
# Open in Chrome on Android emulator
npx playwright test --project="Mobile Chrome" --headed
```

---

## Deployment

**Not in scope for MVP** but for future reference:

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Deploy to Other Platforms

Next.js supports various deployment targets:
- **Netlify**: `npm run build` → deploy `./out` directory (static export)
- **Docker**: Use Next.js official Docker image
- **Traditional hosting**: `npm run build` → `npm start` on Node.js server

---

## Performance Monitoring

### Development Mode

Built-in Web Vitals reporting in `app/layout.tsx`:

```typescript
export function reportWebVitals(metric) {
  console.log(metric);
}
```

### Production Mode

**Future consideration** (not in scope):
- Integrate Vercel Analytics or Google Analytics
- Track Core Web Vitals in production
- Alert if FCP >1.8s or LCP >2.5s

---

## Useful Commands

```bash
# Development
npm run dev                  # Start dev server
npm run build                # Production build
npm start                    # Start production server

# Testing
npm test                     # Run Jest unit tests
npm test -- --coverage       # With coverage report
npx playwright test          # Run E2E tests
npx playwright test --ui     # Interactive mode

# Analysis
npm run lint                 # Run ESLint
npm run analyze              # Bundle size analysis
npx lighthouse http://localhost:3000 --view  # Performance audit

# Type Checking
npx tsc --noEmit             # Check TypeScript types without compiling
```

---

## Next Steps After Implementation

1. **Code Review**: Ensure Constitution compliance (all 5 principles)
2. **Manual Testing**: Complete testing checklist above
3. **Performance Audit**: Run Lighthouse, verify <200KB bundle
4. **Documentation**: Update README.md with usage instructions
5. **Commit**: Follow commit message guidelines
6. **Deploy** (optional): Push to production environment

---

## Support & Resources

- **Next.js Docs**: https://nextjs.org/docs
- **TailwindCSS Docs**: https://tailwindcss.com/docs
- **React Testing Library**: https://testing-library.com/react
- **Playwright Docs**: https://playwright.dev

---

## Constitution Compliance Checklist

Before marking feature complete, verify:

- [ ] **Mobile-First**: Tested on 320px viewport, touch targets ≥44px
- [ ] **Code Quality**: TypeScript strict mode, zero ESLint warnings, JSDoc comments
- [ ] **Testing**: ≥80% coverage, all critical journeys tested
- [ ] **UX Consistency**: Design tokens used, accessible (WCAG 2.1 AA)
- [ ] **Performance**: Bundle <200KB, FCP <1.8s, LCP <2.5s on 4G

✅ All gates passed → Ready for `/speckit.tasks`
