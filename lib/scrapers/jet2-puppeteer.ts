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

    // Block unnecessary resources for speed
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const resourceType = req.resourceType();
      if (["image", "stylesheet", "font", "media"].includes(resourceType)) {
        req.abort();
      } else {
        req.continue();
      }
    });

    console.log(`[Puppeteer] Navigating to: ${url}`);

    // Navigate with timeout
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });

    // Wait for key content to load
    await page.waitForSelector("h1", { timeout: 15000 }).catch(() => {});

    // Additional wait for dynamic content
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Extract data from page
    const data = await page.evaluate(() => {
      // Helper to get text content safely
      const getText = (selector: string): string | null => {
        const el = document.querySelector(selector);
        return el?.textContent?.trim() || null;
      };

      // Extract JSON-LD data
      let jsonLdName: string | null = null;
      let jsonLdImage: string | null = null;
      let jsonLdRating: string | null = null;

      const jsonLdScripts = document.querySelectorAll(
        'script[type="application/ld+json"]'
      );
      for (const script of jsonLdScripts) {
        try {
          const data = JSON.parse(script.textContent || "{}");
          if (data["@type"] === "Hotel") {
            jsonLdName = data.name || null;
            jsonLdImage = data.image || null;
            jsonLdRating = data.starRating?.ratingValue || null;
            break;
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

      // Get image URL
      const imageUrl =
        jsonLdImage ||
        document
          .querySelector('meta[property="og:image"]')
          ?.getAttribute("content") ||
        null;

      // Get star rating from JSON-LD
      const starRating = jsonLdRating ? parseFloat(jsonLdRating) : null;

      // Extract prices from page text
      const bodyText = document.body.innerText;

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
        starRating,
        totalPrice,
        pricePerPerson,
        originalPrice,
        boardBasis,
        pageTitle: document.title,
      };
    });

    console.log(`[Puppeteer] Extracted data:`, data);

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
      url,
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
