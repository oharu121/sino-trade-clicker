# Plan: Add custom URL tab for arbitrary click targets

**Status:** Completed
**Date:** 2026-07-24

## Context

The application had two hardcoded channel tabs (深談總經 and 川普專題) for boosting article views on Sino Trade. Both tabs required fetching articles from Sino Trade's GraphQL API, selecting one, and then boosting its computed URL. Users needed the ability to boost views on arbitrary URLs — not just articles from predefined channels. This required a new tab mode that bypasses article fetching entirely and lets users enter any URL directly.

## Approach

Rather than building a separate flow, we reused the existing `Article` type which already had an optional `url` field. When `article.url` is set, the boost service uses it directly instead of computing a URL via `buildArticleUrl()`. This keeps the change minimal — a single conditional in the service layer, relaxed validation in the API, and conditional UI rendering in the page. The `ArticleChannel` type was extended to accommodate the new tab alongside existing ones.

## Changes

### 1. Type system (`lib/types.ts`)
Widened `ArticleChannel.id` and `ArticleChannel.label` union types to include `'custom-url'` and `'自訂網址'`.

### 2. Channel configuration (`lib/constants.ts`)
Added `CHANNELS.CUSTOM_URL` entry with empty `channelId` (not used), default 200 clicks at 300ms interval. Appended to `CHANNEL_LIST` as the third tab.

### 3. Boost service (`lib/boostService.ts`)
Changed URL resolution to `article.url || buildArticleUrl(article, article.channelId)`. When `article.url` is present (custom URL mode), it's used directly; otherwise falls back to the existing URL builder.

### 4. API route (`app/api/boost-view/route.ts`)
- Relaxed validation: only `url` is required, `articleTitle` is optional
- When `articleTitle` is empty, title verification is skipped (`titleFound = true`)
- Success criteria becomes: 2xx status + no WAF block (title match only when title provided)

### 5. Page UI (`app/page.tsx`)
- Added `customUrl` state and `isCustomUrl` derived flag
- Custom URL tab renders a text input (`type="url"`) instead of `ArticleSelector`
- URL validation via `new URL()` constructor — only `http:` and `https:` protocols accepted
- Valid URL creates a synthetic `Article` with `{ _id: 'custom', title: '', url: customUrl }`
- "Selected" display shows URL text instead of article title in custom mode
- Tab switching clears `customUrl` state
- Article fetching short-circuits when custom URL tab is active

## Files Modified

| File | Change |
| --- | --- |
| [lib/types.ts](lib/types.ts) | Extended union types for custom-url channel |
| [lib/constants.ts](lib/constants.ts) | Added CUSTOM_URL channel config and list entry |
| [lib/boostService.ts](lib/boostService.ts) | Use article.url when present, fallback to buildArticleUrl |
| [app/api/boost-view/route.ts](app/api/boost-view/route.ts) | Made articleTitle optional, skip title verification when absent |
| [app/page.tsx](app/page.tsx) | Custom URL input UI, synthetic article creation, conditional rendering |

## Guard Rails

| Scenario | Behavior |
| --- | --- |
| Invalid URL entered (no protocol or non-http) | Validation error shown, start button stays disabled |
| Custom URL with WAF protection | Existing WAF detection + 3-consecutive-failure auto-stop applies |
| Tab switch during idle | Clears custom URL and selected article |
| Tab switch during operation | Blocked — channel change disabled when not idle |
| Synthetic article._id is 'custom' (not 24-char hex) | buildArticleUrl would throw, but never called since article.url is set |

## Verification

1. `pnpm test` — all 124 existing tests pass
2. Switch to 自訂網址 tab — URL input renders, no article dropdown
3. Enter invalid URL — error message appears, start button disabled
4. Enter valid https:// URL — selected article display shows URL
5. Start boost — requests go to exact URL entered
6. Switch back to 深談總經 tab — article selector reappears, URL cleared
7. Existing channel tabs still work with title verification

## Breaking Changes

None
