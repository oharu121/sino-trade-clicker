<!--
SYNC IMPACT REPORT
==================
Version Change: NEW → 1.0.0
This is the initial constitution ratification.

Principles Established:
- I. Mobile-First Design (NEW)
- II. Code Quality Standards (NEW)
- III. Testing Discipline (NEW)
- IV. User Experience Consistency (NEW)
- V. Performance Requirements (NEW)

Sections Added:
- Core Principles (5 principles)
- Development Standards (quality gates, code review requirements)
- Deployment & Release (release criteria, versioning policy)
- Governance (amendment procedure, compliance review)

Templates Requiring Updates:
- ✅ .specify/templates/plan-template.md - Constitution Check section ready
- ✅ .specify/templates/spec-template.md - Requirements alignment ready
- ✅ .specify/templates/tasks-template.md - Task categorization ready

Follow-up TODOs:
- None - all placeholders filled
-->

# Sino Trade Clicker Constitution

## Core Principles

### I. Mobile-First Design

All features and interfaces MUST be designed and implemented for mobile devices first,
then enhanced for larger screens. This principle is non-negotiable and applies to every
user-facing component.

**Requirements:**
- Design mockups and wireframes start with mobile viewport (320px-428px width)
- Touch targets MUST be minimum 44x44px for accessibility
- Navigation patterns MUST work with one-handed mobile use
- Responsive breakpoints progress from mobile → tablet → desktop
- Performance budgets prioritize mobile network conditions (3G/4G)
- Testing MUST include real mobile devices, not just browser emulation

**Rationale:** The target user base primarily accesses the application via mobile devices.
A mobile-first approach ensures the core experience serves the majority of users and
prevents retrofitting mobile support as an afterthought.

### II. Code Quality Standards

All code MUST meet defined quality standards before merge. Quality is enforced through
automated tooling and human review. Technical debt MUST be justified and tracked.

**Requirements:**
- TypeScript strict mode enabled with zero `any` types in new code
- ESLint configuration MUST pass with zero warnings
- Code formatting via Prettier (automatic on save/commit)
- Maximum function complexity: 10 cyclomatic complexity
- Maximum file length: 300 lines (exceptions require justification)
- All exports MUST have JSDoc comments explaining purpose and usage
- Code reviews MUST verify: readability, maintainability, performance implications
- Security vulnerabilities (OWASP Top 10) MUST be caught in review

**Rationale:** Consistent code quality reduces bugs, improves maintainability, enables
faster onboarding of new developers, and prevents accumulation of technical debt that
degrades velocity over time.

### III. Testing Discipline

Tests are mandatory for all business logic and critical user journeys. Tests MUST be
written to validate requirements, not just achieve coverage metrics.

**Requirements:**
- Unit tests for all services, utilities, and business logic functions
- Integration tests for critical user journeys (defined in feature specs)
- Component tests for interactive UI elements
- Minimum 80% code coverage for new code (measured per pull request)
- Tests MUST be written BEFORE implementation when following TDD workflow
- All tests MUST pass in CI/CD pipeline before merge
- Flaky tests MUST be fixed or removed within 48 hours
- Test names MUST clearly describe the scenario being tested

**Rationale:** Comprehensive testing prevents regressions, enables confident refactoring,
serves as living documentation of system behavior, and catches bugs before they reach
production where they cost significantly more to fix.

### IV. User Experience Consistency

User interface patterns, interactions, and visual design MUST remain consistent across
all features. Deviations from established patterns require explicit design review.

**Requirements:**
- All UI components sourced from shared component library
- Design tokens (colors, spacing, typography) MUST be used; no magic numbers
- Interaction patterns (navigation, forms, feedback) follow established conventions
- Error messages and validation feedback use consistent language and placement
- Loading states and skeleton screens required for async operations >300ms
- Accessibility standards: WCAG 2.1 AA minimum (semantic HTML, ARIA labels, keyboard nav)
- Design review required before implementing new patterns not in the design system

**Rationale:** Consistent UX reduces cognitive load for users, creates a professional
impression, improves learnability, and ensures accessibility compliance. Fragmented
experiences confuse users and dilute brand identity.

### V. Performance Requirements

Application performance MUST meet defined budgets. Performance regressions are treated
as bugs and block releases.

**Requirements:**
- First Contentful Paint (FCP): <1.8s on 4G mobile
- Largest Contentful Paint (LCP): <2.5s on 4G mobile
- Time to Interactive (TTI): <3.5s on 4G mobile
- Cumulative Layout Shift (CLS): <0.1
- First Input Delay (FID): <100ms
- JavaScript bundle size: <200KB initial (gzipped)
- Image optimization: WebP format, lazy loading below fold, responsive images
- API response time: p95 <500ms for read operations, <1000ms for writes
- Performance monitoring in production with alerting on budget violations

**Rationale:** Performance directly impacts user satisfaction, conversion rates, and SEO
rankings. Mobile users on slower networks represent a significant portion of traffic.
Performance budgets prevent gradual degradation and ensure accountability.

## Development Standards

### Quality Gates

All pull requests MUST pass these gates before merge approval:

1. **Automated Checks**
   - All tests passing in CI/CD pipeline
   - ESLint with zero errors, zero warnings
   - TypeScript compilation with no errors
   - Build succeeds without warnings
   - Performance budgets not exceeded

2. **Code Review Requirements**
   - At least one approving review from a team member
   - All review comments addressed or discussed
   - Constitution compliance verified (checklist in PR template)
   - Security implications reviewed for sensitive operations

3. **Documentation Requirements**
   - User-facing changes include updated documentation
   - API changes include updated contract documentation
   - Breaking changes include migration guide

### Complexity Justification

Complexity beyond standard patterns requires explicit justification:

- New architectural patterns MUST document problem solved and alternatives rejected
- Additional third-party dependencies MUST justify value vs. bundle size cost
- Abstraction layers MUST demonstrate clear separation of concerns benefit
- Premature optimization MUST be avoided; measure before optimizing

## Deployment & Release

### Release Criteria

A release is deployable when:

1. All Constitution principles verified for changed code
2. All automated tests passing
3. Manual testing of critical user journeys completed
4. Performance budgets verified in staging environment
5. Security scan completed with no high/critical vulnerabilities
6. Documentation updated to reflect changes
7. Rollback plan documented for breaking changes

### Versioning Policy

**Version Format**: MAJOR.MINOR.PATCH (semantic versioning)

- **MAJOR**: Breaking changes in user-facing features or APIs
- **MINOR**: New features, non-breaking enhancements
- **PATCH**: Bug fixes, performance improvements, refactoring

## Governance

### Amendment Procedure

Constitution amendments require:

1. Proposal documenting rationale and impact analysis
2. Team discussion and consensus (majority approval)
3. Update to constitution with version increment:
   - MAJOR: Principle removal or incompatible redefinition
   - MINOR: New principle added or materially expanded guidance
   - PATCH: Clarifications, wording improvements, typo fixes
4. Propagation of changes to dependent templates (plan, spec, tasks)
5. Communication to all team members

### Compliance Review

- Constitution compliance MUST be verified in every pull request
- Plan template includes Constitution Check gate (verified before Phase 0)
- Task template enforces testing discipline and quality standards
- Spec template ensures user experience consistency through acceptance criteria
- Quarterly review of constitution effectiveness and amendment proposals

### Version Control

This constitution uses semantic versioning. Each amendment updates the version number
and amendment date. Ratification date remains constant as the original adoption date.

**Version**: 1.0.0 | **Ratified**: 2025-11-05 | **Last Amended**: 2025-11-05
