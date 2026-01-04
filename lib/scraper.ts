import * as cheerio from "cheerio";

export interface FetchOptions {
  headers?: Record<string, string>;
  timeout?: number;
}

const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  "Accept-Language": "en-GB,en;q=0.9",
  "Cache-Control": "no-cache",
};

/**
 * Fetch HTML content from a URL with proper headers
 */
export async function fetchPage(
  url: string,
  options: FetchOptions = {}
): Promise<{ html: string; status: number }> {
  const { headers = {}, timeout = 60000 } = options; // Increased to 60s

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      headers: { ...DEFAULT_HEADERS, ...headers },
      signal: controller.signal,
    });

    const html = await response.text();
    return { html, status: response.status };
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Parse HTML string into a Cheerio instance
 */
export function parseHtml(html: string) {
  return cheerio.load(html);
}

/**
 * Extract text content, trimmed and cleaned
 */
export function cleanText(text: string | undefined): string {
  if (!text) return "";
  return text.replace(/\s+/g, " ").trim();
}

/**
 * Parse price string to number (handles £, €, etc.)
 */
export function parsePrice(priceStr: string | undefined): number | null {
  if (!priceStr) return null;
  const cleaned = priceStr.replace(/[^0-9.,]/g, "").replace(",", "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * Parse date string to ISO format
 */
export function parseDate(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split("T")[0];
  } catch {
    return null;
  }
}

/**
 * Extract duration (nights) from text like "7 nights" or "14 nts"
 */
export function parseDuration(text: string | undefined): number | null {
  if (!text) return null;
  const match = text.match(/(\d+)\s*(?:nights?|nts?)/i);
  return match ? parseInt(match[1], 10) : null;
}

/**
 * Extract star rating from text or class names
 */
export function parseRating(text: string | undefined): number | null {
  if (!text) return null;
  const match = text.match(/(\d(?:\.\d)?)\s*(?:star|★|\*)/i);
  if (match) return parseFloat(match[1]);
  // Try just numbers
  const numMatch = text.match(/(\d(?:\.\d)?)/);
  return numMatch ? parseFloat(numMatch[1]) : null;
}

/**
 * Sleep for rate limiting
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Make URL absolute if relative
 */
export function makeAbsoluteUrl(url: string, baseUrl: string): string {
  if (url.startsWith("http")) return url;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) return new URL(url, baseUrl).href;
  return new URL(url, baseUrl).href;
}
