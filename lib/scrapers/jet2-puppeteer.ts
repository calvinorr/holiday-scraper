import puppeteer, { Browser, Page } from "puppeteer";
import type { NewDeal } from "@/drizzle/schema";

// Board basis mapping
const JET2_BOARD_BASIS: Record<number, string> = {
  1: "Bed and Breakfast",
  2: "Half Board",
  3: "Full Board",
  4: "All Inclusive",
  5: "Room Only",
  6: "Self Catering",
};

// Airport codes mapping
const JET2_AIRPORTS: Record<number, string> = {
  4: "BFS", // Belfast International
  1: "BHX", // Birmingham
  2: "EMA", // East Midlands
  3: "EDI", // Edinburgh
  5: "GLA", // Glasgow
  6: "LBA", // Leeds Bradford
  7: "MAN", // Manchester
  8: "NCL", // Newcastle
  9: "STN", // London Stansted
};

interface ScrapeResult {
  success: boolean;
  deal?: Partial<NewDeal>;
  error?: string;
}

let browserInstance: Browser | null = null;

/**
 * Get or create a browser instance (reuse for performance)
 */
async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.connected) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--window-size=1920,1080",
      ],
    });
  }
  return browserInstance;
}

/**
 * Close the browser instance
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

/**
 * Parse Jet2 URL parameters
 */
function parseJet2Url(url: string): Record<string, string> {
  const urlObj = new URL(url);
  const params: Record<string, string> = {};
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

/**
 * Extract location from URL path
 */
function extractLocationFromPath(url: string): {
  country: string | null;
  resort: string | null;
  destination: string | null;
} {
  const urlObj = new URL(url);
  const parts = urlObj.pathname.split("/").filter(Boolean);

  let country: string | null = null;
  let resort: string | null = null;
  let destination: string | null = null;

  if (parts.length >= 3) {
    country = parts[1] || null;
    destination = parts[2] || null;
    resort = parts.length >= 4 ? parts[3] : null;
  }

  const capitalize = (s: string) =>
    s
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  return {
    country: country ? capitalize(country) : null,
    resort: resort ? capitalize(resort) : null,
    destination: destination ? capitalize(destination) : null,
  };
}

/**
 * Parse date from Jet2 format (dd-mm-yyyy) to ISO
 */
function parseJet2Date(dateStr: string | undefined): string | null {
  if (!dateStr) return null;
  const [day, month, year] = dateStr.split("-");
  if (!day || !month || !year) return null;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

/**
 * Scrape a Jet2 deal page using Puppeteer
 */
export async function scrapeJet2WithPuppeteer(url: string): Promise<ScrapeResult> {
  let page: Page | null = null;

  try {
    const browser = await getBrowser();
    page = await browser.newPage();

    // Set viewport and user agent
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Only block heavy resources, keep images for URL extraction
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const resourceType = req.resourceType();
      if (["stylesheet", "font", "media"].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    console.log(`[Puppeteer] Navigating to: ${url}`);

    // Navigate with timeout
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // Wait for key content to load
    await page.waitForSelector("h1", { timeout: 15000 }).catch(() => {});

    // Additional wait for dynamic content to fully load
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Extract comprehensive data from page
    const data = await page.evaluate(() => {
      // Helper to get text content safely
      const getText = (selector: string): string | null => {
        const el = document.querySelector(selector);
        return el?.textContent?.trim() || null;
      };

      // Helper to get all text from multiple elements
      const getAllText = (selector: string): string[] => {
        const elements = document.querySelectorAll(selector);
        return Array.from(elements)
          .map((el) => el.textContent?.trim())
          .filter((t): t is string => !!t);
      };

      // Extract JSON-LD data
      let jsonLdName: string | null = null;
      let jsonLdImage: string | null = null;
      let jsonLdRating: string | null = null;
      let jsonLdDescription: string | null = null;
      let jsonLdAmenities: string[] = [];
      let jsonLdReviewScore: number | null = null;
      let jsonLdReviewCount: number | null = null;

      const jsonLdScripts = document.querySelectorAll(
        'script[type="application/ld+json"]'
      );
      for (const script of jsonLdScripts) {
        try {
          const jsonData = JSON.parse(script.textContent || "{}");
          if (jsonData["@type"] === "Hotel") {
            jsonLdName = jsonData.name || null;
            jsonLdImage = jsonData.image || null;
            jsonLdRating = jsonData.starRating?.ratingValue || null;
            jsonLdDescription = jsonData.description || null;
            if (jsonData.amenityFeature) {
              jsonLdAmenities = jsonData.amenityFeature
                .map((a: { name?: string; value?: string }) => a.name || a.value)
                .filter(Boolean);
            }
            if (jsonData.aggregateRating) {
              jsonLdReviewScore = parseFloat(jsonData.aggregateRating.ratingValue) || null;
              jsonLdReviewCount = parseInt(jsonData.aggregateRating.reviewCount) || null;
            }
          }
        } catch {
          // Ignore parse errors
        }
      }

      // Get hotel name
      const hotelName =
        jsonLdName ||
        document.querySelector("h1")?.textContent?.trim() ||
        null;

      // Get main image URL
      const imageUrl =
        jsonLdImage ||
        document
          .querySelector('meta[property="og:image"]')
          ?.getAttribute("content") ||
        null;

      // Get star rating from JSON-LD
      const starRating = jsonLdRating ? parseFloat(jsonLdRating) : null;

      // Extract all image URLs from the page
      const images: string[] = [];

      // Look for gallery images
      const galleryImages = document.querySelectorAll(
        '[class*="gallery"] img, [class*="carousel"] img, [class*="slider"] img, [data-testid*="image"] img'
      );
      galleryImages.forEach((img) => {
        const src = img.getAttribute("src") || img.getAttribute("data-src");
        if (src && src.startsWith("http") && !images.includes(src)) {
          images.push(src);
        }
      });

      // Also look for srcset images
      const allImages = document.querySelectorAll("img[src*='jet2'], img[src*='media']");
      allImages.forEach((img) => {
        const src = img.getAttribute("src");
        if (src && src.startsWith("http") && src.includes("jet2") && !images.includes(src)) {
          images.push(src);
        }
      });

      // Extract description - look for common patterns
      let description: string | null = jsonLdDescription;

      if (!description) {
        // Try to find description in various places
        const descSelectors = [
          '[class*="description"]',
          '[class*="about"]',
          '[class*="overview"]',
          '[data-testid*="description"]',
          'section p',
          'article p',
        ];

        for (const selector of descSelectors) {
          const elements = document.querySelectorAll(selector);
          const texts: string[] = [];
          elements.forEach((el) => {
            const text = el.textContent?.trim();
            if (text && text.length > 50 && text.length < 2000) {
              texts.push(text);
            }
          });
          if (texts.length > 0) {
            description = texts.join("\n\n");
            break;
          }
        }
      }

      // Extract amenities/facilities
      let amenities: string[] = jsonLdAmenities;

      if (amenities.length === 0) {
        // Look for facility/amenity lists
        const amenitySelectors = [
          '[class*="facilities"] li',
          '[class*="amenities"] li',
          '[class*="features"] li',
          '[data-testid*="facility"]',
          '[data-testid*="amenity"]',
        ];

        for (const selector of amenitySelectors) {
          const found = getAllText(selector);
          if (found.length > 0) {
            amenities = found.filter((a) => a.length < 100); // Filter out long strings
            break;
          }
        }

        // If still no amenities, look for icons with text
        if (amenities.length === 0) {
          const iconItems = document.querySelectorAll('[class*="icon"] + span, [class*="facility"]');
          iconItems.forEach((item) => {
            const text = item.textContent?.trim();
            if (text && text.length > 2 && text.length < 50) {
              amenities.push(text);
            }
          });
        }
      }

      // Extract reviews
      let reviewScore = jsonLdReviewScore;
      let reviewCount = jsonLdReviewCount;
      const reviews: { rating?: number; text?: string; author?: string }[] = [];

      // Look for review score patterns in text
      const bodyText = document.body.innerText;

      if (!reviewScore) {
        // Match patterns like "4.5/5" or "4.5 out of 5" or "Rating: 4.5"
        const scoreMatch = bodyText.match(/(\d+\.?\d*)\s*(?:\/\s*5|out of 5)/i);
        if (scoreMatch) {
          reviewScore = parseFloat(scoreMatch[1]);
        }
      }

      if (!reviewCount) {
        // Match patterns like "123 reviews" or "Based on 123 reviews"
        const countMatch = bodyText.match(/(\d+)\s*reviews?/i);
        if (countMatch) {
          reviewCount = parseInt(countMatch[1]);
        }
      }

      // Look for individual reviews
      const reviewSelectors = [
        '[class*="review"]',
        '[data-testid*="review"]',
        '[class*="testimonial"]',
      ];

      for (const selector of reviewSelectors) {
        const reviewElements = document.querySelectorAll(selector);
        reviewElements.forEach((el) => {
          const text = el.textContent?.trim();
          if (text && text.length > 20 && text.length < 1000) {
            // Try to extract rating from the review element
            const ratingEl = el.querySelector('[class*="rating"], [class*="star"]');
            let rating: number | undefined;
            if (ratingEl) {
              const ratingText = ratingEl.textContent?.match(/(\d+\.?\d*)/);
              if (ratingText) {
                rating = parseFloat(ratingText[1]);
              }
            }

            reviews.push({
              text: text.substring(0, 500),
              rating,
            });
          }
        });

        if (reviews.length >= 5) break; // Limit to 5 reviews
      }

      // Extract prices from page text
      // Match "Payable to Jet2holidays £X,XXX"
      const totalMatch = bodyText.match(
        /Payable to Jet2holidays[^£]*£([\d,]+)/i
      );
      const totalPrice = totalMatch
        ? parseFloat(totalMatch[1].replace(",", ""))
        : null;

      // Match "Price per person £X,XXX"
      const ppMatch = bodyText.match(/Price per person[^£]*£([\d,]+)/i);
      const pricePerPerson = ppMatch
        ? parseFloat(ppMatch[1].replace(",", ""))
        : null;

      // Match "Base price £X,XXX"
      const baseMatch = bodyText.match(/Base price[^£]*£([\d,]+)/i);
      const originalPrice = baseMatch
        ? parseFloat(baseMatch[1].replace(",", ""))
        : null;

      // Get board basis from page - look for common patterns
      let boardBasis: string | null = null;
      const boardPatterns = [
        "All Inclusive",
        "Half Board",
        "Full Board",
        "Bed and Breakfast",
        "Room Only",
        "Self Catering",
      ];
      for (const pattern of boardPatterns) {
        if (bodyText.includes(pattern)) {
          boardBasis = pattern;
          break;
        }
      }

      return {
        hotelName,
        imageUrl,
        images: images.slice(0, 10), // Limit to 10 images
        starRating,
        totalPrice,
        pricePerPerson,
        originalPrice,
        boardBasis,
        description,
        amenities: [...new Set(amenities)].slice(0, 20), // Unique, max 20
        reviewScore,
        reviewCount,
        reviews: reviews.slice(0, 5), // Max 5 reviews
        pageTitle: document.title,
      };
    });

    console.log(`[Puppeteer] Extracted data:`, {
      hotelName: data.hotelName,
      images: data.images?.length,
      amenities: data.amenities?.length,
      reviewScore: data.reviewScore,
      reviewCount: data.reviewCount,
      reviews: data.reviews?.length,
      descriptionLength: data.description?.length,
    });

    // Parse URL params and location
    const params = parseJet2Url(url);
    const location = extractLocationFromPath(url);

    // Get airport code
    const airportId = params.airport ? parseInt(params.airport, 10) : null;
    const departureAirport = airportId ? JET2_AIRPORTS[airportId] || null : null;

    // Parse dates
    const departureDate = parseJet2Date(params.date);
    const duration = params.duration ? parseInt(params.duration, 10) : null;
    let returnDate: string | null = null;
    if (departureDate && duration) {
      const depDate = new Date(departureDate);
      depDate.setDate(depDate.getDate() + duration);
      returnDate = depDate.toISOString().split("T")[0];
    }

    // Board basis from URL if not found in page
    const boardId = params.board ? parseInt(params.board, 10) : null;
    const boardBasis = data.boardBasis || (boardId ? JET2_BOARD_BASIS[boardId] : null);

    // Build destination string
    const destinationParts = [location.resort, location.destination, location.country]
      .filter(Boolean)
      .join(", ");

    // Validate we have minimum required data
    if (!data.hotelName || !data.totalPrice) {
      return {
        success: false,
        error: `Missing required data: hotelName=${data.hotelName}, totalPrice=${data.totalPrice}`,
      };
    }

    const deal: Partial<NewDeal> = {
      title: data.hotelName,
      destination: destinationParts || location.country || "Unknown",
      country: location.country,
      resort: location.resort,
      price: data.totalPrice,
      pricePerPerson: data.pricePerPerson,
      originalPrice: data.originalPrice,
      currency: "GBP",
      departureAirport,
      departureDate,
      returnDate,
      duration,
      hotelName: data.hotelName,
      hotelRating: data.starRating,
      boardBasis,
      imageUrl: data.imageUrl,
      images: data.images?.length ? JSON.stringify(data.images) : null,
      url,
      description: data.description,
      amenities: data.amenities?.length ? JSON.stringify(data.amenities) : null,
      reviewScore: data.reviewScore,
      reviewCount: data.reviewCount,
      reviews: data.reviews?.length ? JSON.stringify(data.reviews) : null,
      rawData: JSON.stringify({ params, extractedData: data, location }),
    };

    return { success: true, deal };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[Puppeteer] Error scraping ${url}:`, message);
    return { success: false, error: message };
  } finally {
    if (page) {
      await page.close().catch(() => {});
    }
  }
}

/**
 * Scrape multiple URLs
 */
export async function scrapeMultipleJet2Urls(
  urls: string[]
): Promise<Map<string, ScrapeResult>> {
  const results = new Map<string, ScrapeResult>();

  for (const url of urls) {
    const result = await scrapeJet2WithPuppeteer(url);
    results.set(url, result);

    // Small delay between requests to be polite
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  return results;
}
