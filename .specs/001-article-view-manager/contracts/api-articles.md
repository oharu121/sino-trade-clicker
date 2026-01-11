# API Contract: /api/articles

**Endpoint**: `POST /api/articles`
**Purpose**: Proxy to Sino Trade GraphQL API for fetching article lists by channel
**Location**: `app/api/articles/route.ts`

---

## Request

### Method
`POST`

### Headers
```http
Content-Type: application/json
```

### Body Schema

```typescript
interface ArticlesRequest {
  /** GraphQL channel ID */
  channelId: string;

  /** Number of articles to fetch */
  limit: number;

  /** Page number (0-indexed) */
  page: number;

  /** Number of items to skip */
  skip: number;
}
```

### Example Request

```json
{
  "channelId": "6514f8b3b13f2760605fcef1",
  "limit": 100,
  "page": 0,
  "skip": 1
}
```

### Validation Rules

- `channelId`: Required, must be non-empty string (24-char hex for MongoDB ObjectId)
- `limit`: Required, integer 1-1000 (default: 100)
- `page`: Required, integer ≥0 (default: 0)
- `skip`: Required, integer ≥0 (default: 1)

### Error Responses (4xx)

**400 Bad Request**
```json
{
  "error": "Invalid request body",
  "details": "channelId is required"
}
```

**422 Unprocessable Entity**
```json
{
  "error": "Validation failed",
  "details": "limit must be between 1 and 1000"
}
```

---

## Response

### Success (200 OK)

#### Schema

```typescript
interface ArticlesResponse {
  /** Array of articles from GraphQL API */
  articles: Article[];

  /** Total count of articles in channel (if available) */
  total?: number;
}

interface Article {
  /** MongoDB ObjectId */
  _id: string;

  /** Article title in Chinese */
  title: string;
}
```

#### Example Response

```json
{
  "articles": [
    {
      "_id": "68ff23fb032bb6011632bed5",
      "title": "中國四中全會落幕，通過十五五年規劃，美中角力下，科技自立自強成為中國政策核心，陸港股能否複製美股AI行情？"
    },
    {
      "_id": "68f5ca6d032bb601160a9f8e",
      "title": "美國兩家區域銀行-錫安、西聯接連暴雷，會演變為系統性金融危機嗎?"
    }
  ],
  "total": 127
}
```

### Error Responses (5xx)

**500 Internal Server Error**
```json
{
  "error": "Failed to fetch articles from Sino Trade API",
  "details": "Network error: timeout after 5000ms"
}
```

**502 Bad Gateway**
```json
{
  "error": "Upstream API error",
  "details": "Sino Trade GraphQL API returned 500"
}
```

**503 Service Unavailable**
```json
{
  "error": "Sino Trade API temporarily unavailable",
  "details": "Retry after 30 seconds"
}
```

---

## Implementation Details

### GraphQL Query Template

The Next.js API route sends this GraphQL query to Sino Trade API:

```graphql
query ($input: clientGetContentListInput) {
  clientGetArticleList(input: $input) {
    filtered {
      _id
      title
    }
  }
}
```

### Variables Mapping

```typescript
const variables = {
  input: {
    channel: req.body.channelId,
    limit: req.body.limit,
    page: req.body.page,
    skip: req.body.skip
  }
};
```

### Upstream API Details

- **URL**: `https://www.sinotrade.com.tw/richclub/api/graphql`
- **Method**: `POST`
- **Timeout**: 5000ms
- **Retry Strategy**: 3 attempts with exponential backoff (1s, 2s, 4s)

### Response Transformation

```typescript
// Extract articles from GraphQL response
const articles = response.data.clientGetArticleList.filtered;

// Return simplified schema
return {
  articles: articles.map(({ _id, title }) => ({ _id, title })),
  total: articles.length
};
```

### Caching Strategy

- **Client-side**: React Query / SWR (stale-while-revalidate, 5min cache)
- **Server-side**: Next.js `fetch` cache (revalidate every 60s)

```typescript
// In route.ts
const response = await fetch(GRAPHQL_ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query, variables }),
  next: { revalidate: 60 } // Cache for 60 seconds
});
```

### Error Handling

```typescript
try {
  // Attempt fetch with retry logic
  const data = await fetchWithRetry(url, options, { maxRetries: 3 });
  return NextResponse.json({ articles: data.filtered });
} catch (error) {
  if (error.name === 'TimeoutError') {
    return NextResponse.json(
      { error: 'Request timeout', details: error.message },
      { status: 504 }
    );
  }
  return NextResponse.json(
    { error: 'Internal server error', details: error.message },
    { status: 500 }
  );
}
```

---

## Rate Limiting

**Not implemented in MVP** (single-user tool, low traffic expected)

**Future consideration** (if deployed publicly):
- 10 requests per minute per IP
- 429 Too Many Requests response when exceeded
- `Retry-After` header with seconds to wait

---

## CORS Configuration

**Not required** - Next.js API routes are same-origin with the frontend.

---

## Security Considerations

1. **Input Sanitization**: Validate `channelId` format to prevent GraphQL injection
2. **Timeout Protection**: 5s timeout prevents hanging requests
3. **Error Message Sanitization**: Don't expose internal stack traces in production
4. **Rate Limiting**: Consider adding if deployed publicly (not in scope for MVP)

---

## Testing

### Unit Tests (`__tests__/api/articles.test.ts`)

```typescript
describe('POST /api/articles', () => {
  it('should return articles for valid channelId', async () => {
    const response = await POST({
      json: () => Promise.resolve({
        channelId: '6514f8b3b13f2760605fcef1',
        limit: 10,
        page: 0,
        skip: 1
      })
    });
    const data = await response.json();
    expect(data.articles).toHaveLength(10);
    expect(data.articles[0]).toHaveProperty('_id');
    expect(data.articles[0]).toHaveProperty('title');
  });

  it('should return 400 for missing channelId', async () => {
    const response = await POST({
      json: () => Promise.resolve({ limit: 10, page: 0, skip: 1 })
    });
    expect(response.status).toBe(400);
  });

  it('should retry on network failure', async () => {
    // Mock fetch to fail twice then succeed
    global.fetch = jest.fn()
      .mockRejectedValueOnce(new Error('Network error'))
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ ok: true, json: async () => ({ data: { ... } }) });

    const response = await POST({ ... });
    expect(global.fetch).toHaveBeenCalledTimes(3);
    expect(response.status).toBe(200);
  });
});
```

### Integration Tests (E2E)

Test via Playwright by calling frontend which calls API route:

```typescript
test('should load articles when tab is selected', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="tab-深談總經"]');
  await page.waitForSelector('[data-testid="article-dropdown"]');
  const options = await page.locator('[data-testid="article-option"]').count();
  expect(options).toBeGreaterThan(0);
});
```

---

## Monitoring

**Production monitoring** (if deployed):
- Log all 5xx errors to error tracking service (Sentry, Datadog)
- Track response times (p50, p95, p99)
- Alert if error rate >5% over 5-minute window
- Alert if upstream API timeout rate >10%

**Development**:
- Console log all requests/responses
- Display network errors in browser DevTools
