/**
 * Backend proxy API for boosting article views
 * @module app/api/boost-view/route
 *
 * Proxies requests to Sino Trade article URLs and verifies successful page load
 * by checking if the response contains the article title.
 */

import { NextRequest, NextResponse } from "next/server";
import { normalizeTextForComparison } from "@/lib/utils/format";

/**
 * Request body schema
 */
interface BoostViewRequest {
  /** Full article URL to request */
  url: string;
  /** Article title to verify in response */
  articleTitle: string;
  /** User-Agent header to use */
  userAgent?: string;
}

/**
 * Response schema
 */
interface BoostViewResponse {
  /** Whether the article page loaded successfully */
  success: boolean;
  /** HTTP status code */
  statusCode: number;
  /** Response time in milliseconds */
  responseTime: number;
  /** Error message if failed */
  error?: string;
  /** Whether title was found in response (if success) */
  titleFound?: boolean;
  /** Extracted document title from HTML */
  documentTitle?: string;
}

/**
 * Extract document title from HTML
 */
function extractDocumentTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : null;
}

/**
 * POST /api/boost-view
 *
 * Sends a request to the article URL and verifies it loaded correctly
 * by checking if the response contains the article title.
 *
 * This bypasses CORS restrictions and allows us to verify the response content.
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = (await request.json()) as BoostViewRequest;
    const { url, articleTitle, userAgent } = body;

    // Validate request
    if (!url || !articleTitle) {
      return NextResponse.json(
        {
          success: false,
          statusCode: 400,
          responseTime: Date.now() - startTime,
          error: "Missing required fields: url and articleTitle",
        } as BoostViewResponse,
        { status: 400 }
      );
    }

    // Make request to article URL
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          userAgent ||
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7",
        "Cache-Control": "no-cache",
      },
      cache: "no-store",
    });

    const responseTime = Date.now() - startTime;
    const statusCode = response.status;

    // Read response body
    const html = await response.text();

    // Check if response is successful
    if (statusCode < 200 || statusCode >= 300) {
      return NextResponse.json({
        success: false,
        statusCode,
        responseTime,
        error: `HTTP ${statusCode}: ${response.statusText}`,
      } as BoostViewResponse);
    }

    // Extract document title
    const documentTitle = extractDocumentTitle(html);

    // Normalize both the expected title and the document title for comparison
    // This handles HTML entities (&amp;), Unicode escapes (\u0026), and whitespace
    const normalizedExpectedTitle = normalizeTextForComparison(articleTitle);
    const normalizedDocumentTitle = documentTitle
      ? normalizeTextForComparison(documentTitle)
      : '';

    // Check if article title is in the document title
    // Using normalized comparison to handle encoding differences:
    // - &amp; vs & vs \u0026
    // - Multiple whitespace variations
    const titleFound = normalizedDocumentTitle.includes(normalizedExpectedTitle);

    // Consider it successful if:
    // 1. Status is 2xx
    // 2. Article title is found in document title (normalized)
    // 3. No WAF rejection message
    const isWafBlock =
      html.includes("The requested URL was rejected") ||
      html.includes("Your support ID is:");

    const success =
      statusCode >= 200 && statusCode < 300 && titleFound && !isWafBlock;

    return NextResponse.json({
      success,
      statusCode,
      responseTime,
      titleFound,
      documentTitle,
      error: isWafBlock
        ? "WAF block detected"
        : !titleFound
        ? "Article title not found in response"
        : undefined,
    } as BoostViewResponse);
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return NextResponse.json(
      {
        success: false,
        statusCode: 500,
        responseTime,
        error: error instanceof Error ? error.message : "Unknown error",
      } as BoostViewResponse,
      { status: 500 }
    );
  }
}
