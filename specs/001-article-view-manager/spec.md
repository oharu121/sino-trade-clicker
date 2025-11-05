# Feature Specification: Sino Trade Article View Manager

**Feature Branch**: `001-article-view-manager`
**Created**: 2025-11-05
**Status**: Draft
**Input**: User description: "pls refer to @requirements/example.html . I want to build an app allows user to increase the view counts of the selected articles. I listed out 2 improvements in @requirements/enable-search.md and @requirements/extra-enhancements.md . I want to implement this under nextjs framework."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Select and Boost Article Views (Priority: P1)

A content manager needs to increase visibility for specific articles by selecting them from a searchable list and initiating automated view count increases to improve article engagement metrics.

**Why this priority**: This is the core functionality that delivers immediate business value - allowing users to boost article visibility through automated view generation.

**Independent Test**: Can be fully tested by selecting any article from the dropdown, setting view count parameters, and verifying that the correct number of requests are sent to the article URL. Delivers standalone value by enabling basic article view boosting.

**Acceptance Scenarios**:

1. **Given** user is on the "深談總經" tab, **When** user opens the article dropdown, **Then** system displays a searchable list of articles from the 深談總經 channel with article titles
2. **Given** user searches for "美股" in the article dropdown, **When** system filters results, **Then** only articles containing "美股" in the title are displayed
3. **Given** user selects an article from the dropdown, **When** user clicks "開始執行", **Then** system sends the configured number of GET requests to the article URL with the specified interval
4. **Given** user is on the "深談總經" tab, **When** the form loads, **Then** 訪問次數 defaults to 200 and 訪問間隔 defaults to 300ms
5. **Given** user is on the "股市熱話" tab, **When** the form loads, **Then** 訪問次數 defaults to 2000 and 訪問間隔 defaults to 300ms
6. **Given** user attempts to set 訪問間隔 below 300ms, **When** form validates, **Then** system prevents submission and shows validation message

---

### User Story 2 - Monitor View Boosting Progress (Priority: P2)

A user needs real-time feedback on the view boosting process, including current progress, success/failure counts, and response times to ensure the operation is running correctly and identify any issues.

**Why this priority**: Real-time monitoring is essential for users to verify the operation is working correctly and catch issues early, but the basic boosting functionality (P1) must work first.

**Independent Test**: Can be tested by starting a view boost operation and verifying that progress updates display in real-time, success/failure counts increment correctly, and average response time is calculated and shown.

**Acceptance Scenarios**:

1. **Given** user starts a view boost operation, **When** requests begin processing, **Then** progress bar updates to show percentage complete
2. **Given** requests are being sent, **When** each request completes, **Then** success count increments for 2xx responses and failure count increments for errors
3. **Given** multiple requests have completed, **When** system calculates metrics, **Then** average response time is displayed in milliseconds
4. **Given** user is viewing the progress section, **When** system logs activities, **Then** activity log displays timestamped entries for key events (start, every 10 requests, errors, completion)
5. **Given** operation completes, **When** final statistics are calculated, **Then** system displays total requests, success count, failure count, average response time, and total duration

---

### User Story 3 - Control Ongoing Operations (Priority: P3)

A user needs to pause an in-progress view boost operation to manage system load, resume it when ready, or start over with different parameters without waiting for completion.

**Why this priority**: Operation control provides flexibility but is less critical than the core boosting and monitoring features. Users can work around this by refreshing the page.

**Independent Test**: Can be tested by starting a view boost, clicking pause to verify operation stops, clicking resume to verify it continues from where it stopped, and clicking start over to verify operation resets with current form values.

**Acceptance Scenarios**:

1. **Given** a view boost operation is running, **When** user clicks "暫停", **Then** system pauses request sending and button changes to "繼續"
2. **Given** an operation is paused, **When** user clicks "繼續", **Then** system resumes sending requests from where it stopped
3. **Given** an operation is running or paused, **When** user clicks "重新開始", **Then** system stops current operation, resets all counters to zero, and allows user to modify parameters
4. **Given** user pauses and resumes, **When** operation completes, **Then** total duration reflects actual elapsed time excluding paused periods

---

### Edge Cases

- What happens when the GraphQL API is unreachable or returns an error?
- What happens when an article URL contains special characters that need URL encoding?
- What happens when user switches tabs while an operation is in progress?
- What happens when user changes form values while operation is paused?
- What happens when the browser loses network connectivity mid-operation?
- What happens when user closes browser tab during operation?
- What happens when article list is empty from GraphQL API?
- What happens when user tries to start operation without selecting an article?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide two tabs labeled "深談總經" and "股市熱話" for selecting article sources
- **FR-002**: System MUST fetch article lists from Sino Trade GraphQL API endpoint (https://www.sinotrade.com.tw/richclub/api/graphql) using channel ID 6514f8b3b13f2760605fcef1 for 深談總經 and 630c2850c6435a2ff402ccfb for 股市熱話
- **FR-003**: System MUST display articles in a searchable dropdown that allows users to filter by article title
- **FR-004**: System MUST construct article URLs in the format: `https://www.sinotrade.com.tw/richclub/MacroExpert/{sanitized-title}--{article-id}` where title special characters (comma, space, etc.) are replaced with hyphens but the separator before ID is always double-dash `--`
- **FR-005**: System MUST allow users to configure 訪問次數 (visit count) with validation ensuring value is between 1 and 10000
- **FR-006**: System MUST allow users to configure 訪問間隔 (visit interval) in milliseconds with minimum value of 300ms
- **FR-007**: System MUST default 訪問次數 to 200 for 深談總經 tab and 2000 for 股市熱話 tab
- **FR-008**: System MUST default 訪問間隔 to 300ms for both tabs
- **FR-009**: System MUST NOT display parallel processing option (simplified from original example.html)
- **FR-010**: System MUST send GET requests to the constructed article URL at the configured interval
- **FR-011**: System MUST display real-time progress including progress bar percentage, current count, success count, failure count, and average response time
- **FR-012**: System MUST maintain an activity log showing timestamped entries for operation start, periodic updates (every 10 requests), errors, and completion
- **FR-013**: System MUST provide pause button to stop request sending while preserving state
- **FR-014**: System MUST provide resume button to continue paused operation from where it stopped
- **FR-015**: System MUST provide start over button to reset operation and allow parameter changes
- **FR-016**: System MUST be optimized for mobile devices with touch-friendly controls (minimum 44x44px touch targets)
- **FR-017**: System MUST auto-focus the article dropdown when tab is loaded or changed
- **FR-018**: System MUST auto-scroll to progress section when operation starts
- **FR-019**: System MUST use distinct, accessible button colors following the design system
- **FR-020**: System MUST randomize User-Agent headers for requests (carry over from example.html)

### Assumptions

- Article IDs from GraphQL API remain stable and unchanged during operation
- GraphQL API pagination limit of 10 articles per request is sufficient for dropdown (can be increased if needed)
- Users will primarily access this tool on mobile devices during work hours
- View count increases are for legitimate content promotion purposes
- Network requests timing is not required to be cryptographically random
- Local state management is sufficient (no persistence needed between sessions)

### Key Entities

- **Article**: Represents a Sino Trade article with unique ID and title from GraphQL API
- **Article Channel**: Represents a content category (深談總經 or 股市熱話) with associated GraphQL channel ID
- **Boost Operation**: Represents a single execution session including configuration (target article, count, interval), state (running/paused/completed), and metrics (progress, success/failure counts, response times)
- **Activity Log Entry**: Represents a timestamped event in the boost operation lifecycle

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can select an article and start a view boost operation within 30 seconds on mobile device
- **SC-002**: System successfully processes 95% of requests without errors under normal network conditions
- **SC-003**: Progress updates display within 100ms of request completion
- **SC-004**: Mobile interface elements meet 44x44px minimum touch target size for accessibility
- **SC-005**: Article dropdown filtering responds to search input within 200ms
- **SC-006**: Users can pause and resume operations without data loss or state corruption
- **SC-007**: Application remains responsive and functional on 4G mobile network with 300ms latency
- **SC-008**: 90% of users successfully complete their first view boost operation without assistance
- **SC-009**: Form auto-focus and auto-scroll behaviors work correctly 100% of the time on mobile devices
- **SC-010**: System respects minimum 300ms interval between requests with <5% timing variance
