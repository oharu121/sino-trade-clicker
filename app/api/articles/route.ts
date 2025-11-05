/**
 * GraphQL API proxy route for fetching articles from Sino Trade API
 * @module app/api/articles/route
 *
 * Endpoint: POST /api/articles
 * Proxies requests to Sino Trade GraphQL API to avoid CORS issues
 *
 * @see specs/001-article-view-manager/contracts/api-articles.md
 */

import { NextRequest, NextResponse } from 'next/server';
import { GRAPHQL_ENDPOINT, API } from '@/lib/constants';

/**
 * Request body schema
 */
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

/**
 * Article entity from GraphQL response
 */
interface Article {
  _id: string;
  title: string;
}

/**
 * Response schema
 */
interface ArticlesResponse {
  articles: Article[];
  total?: number;
}

/**
 * GraphQL query template
 */
const GRAPHQL_QUERY = `
query ($input: clientGetContentListInput) {
  clientGetArticleList(input: $input) {
    filtered {
      _id
      title
    }
  }
}
`;

/**
 * Fetch articles with retry logic
 *
 * @param url - GraphQL endpoint URL
 * @param variables - Query variables
 * @param retries - Number of retry attempts remaining
 * @returns GraphQL response data
 */
async function fetchWithRetry(
  url: string,
  variables: Record<string, unknown>,
  retries: number = API.MAX_RETRIES
): Promise<{ filtered: Article[] }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API.TIMEOUT);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: GRAPHQL_QUERY,
        variables,
      }),
      signal: controller.signal,
      // Next.js cache configuration - revalidate every 60 seconds
      next: { revalidate: 60 },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`GraphQL API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Check for GraphQL errors
    if (data.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
    }

    // Validate response structure
    if (!data.data?.clientGetArticleList?.filtered) {
      throw new Error('Invalid GraphQL response structure');
    }

    return data.data.clientGetArticleList;
  } catch (error) {
    // Retry logic with exponential backoff
    if (retries > 0 && error instanceof Error) {
      const delay = API.RETRY_DELAY * (API.MAX_RETRIES - retries + 1);
      console.warn(`Fetch failed, retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchWithRetry(url, variables, retries - 1);
    }

    throw error;
  }
}

/**
 * Validate request body
 *
 * @param body - Request body to validate
 * @returns Validation error message, or null if valid
 */
function validateRequest(body: unknown): string | null {
  if (!body || typeof body !== 'object') {
    return 'Request body must be a JSON object';
  }

  const req = body as Partial<ArticlesRequest>;

  if (!req.channelId || typeof req.channelId !== 'string') {
    return 'channelId is required and must be a string';
  }

  // Validate MongoDB ObjectId format (24-character hex string)
  if (!/^[a-f0-9]{24}$/i.test(req.channelId)) {
    return 'channelId must be a valid 24-character hex string (MongoDB ObjectId)';
  }

  if (typeof req.limit !== 'number' || req.limit < 1 || req.limit > 1000) {
    return 'limit must be a number between 1 and 1000';
  }

  if (typeof req.page !== 'number' || req.page < 0) {
    return 'page must be a non-negative number';
  }

  if (typeof req.skip !== 'number' || req.skip < 0) {
    return 'skip must be a non-negative number';
  }

  return null;
}

/**
 * POST /api/articles
 *
 * Fetch article list from Sino Trade GraphQL API by channel
 *
 * @param request - Next.js request object
 * @returns JSON response with articles array
 */
export async function POST(request: NextRequest): Promise<NextResponse<ArticlesResponse | { error: string; details?: string }>> {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request
    const validationError = validateRequest(body);
    if (validationError) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationError },
        { status: 400 }
      );
    }

    const { channelId, limit, page, skip } = body as ArticlesRequest;

    // Construct GraphQL variables
    const variables = {
      input: {
        channel: channelId,
        limit,
        page,
        skip,
      },
    };

    // Fetch from GraphQL API with retry logic
    const data = await fetchWithRetry(GRAPHQL_ENDPOINT, variables);

    // Transform response
    const articles = data.filtered.map(({ _id, title }) => ({ _id, title }));

    return NextResponse.json({
      articles,
      total: articles.length,
    });
  } catch (error) {
    console.error('Error fetching articles:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timeout', details: 'GraphQL API did not respond within 5 seconds' },
          { status: 504 }
        );
      }

      if (error.message.includes('GraphQL API returned')) {
        return NextResponse.json(
          { error: 'Upstream API error', details: error.message },
          { status: 502 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to fetch articles from Sino Trade API', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
