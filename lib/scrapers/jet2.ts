import * as cheerio from "cheerio";
import {
  fetchPage,
  parseHtml,
  cleanText,
  parsePrice,
  makeAbsoluteUrl,
} from "@/lib/scraper";
import type { NewDeal } from "@/drizzle/schema";

const JET2_BASE_URL = "https://www.jet2holidays.com";

// Airport codes mapping (Jet2 uses numeric IDs)
export const JET2_AIRPORTS: Record<string, number> = {
  BFS: 4, // Belfast International
  BHX: 1, // Birmingham
  EMA: 2, // East Midlands
  EDI: 3, // Edinburgh
  GLA: 5, // Glasgow
  LBA: 6, // Leeds Bradford
  MAN: 7, // Manchester
  NCL: 8, // Newcastle
  STN: 9, // London Stansted
};

// Board basis mapping
export const JET2_BOARD_BASIS: Record<number, string> = {
  1: "Bed and Breakfast",
  2: "Half Board",
  3: "Full Board",
  4: "All Inclusive",
  5: "Room Only",
  6: "Self Catering",
};

interface Jet2UrlParams {
  holiday?: string;
  duration?: string;
  airport?: string;
  date?: string;
  occupancy?: string;
  board?: string;
}

interface JsonLdHotel {
  "@type": string;
  name: string;
  image?: string;
  address?: string;
  starRating?: {
    "@type": string;
    ratingValue: string;
  };
  aggregateRating?: {
    "@type": string;
    ratingValue: string;
    reviewCount: string;
  };
}

/**
 * Parse Jet2 URL parameters
 */
export function parseJet2Url(url: string): Jet2UrlParams {
  const urlObj = new URL(url);
  return {
    holiday: urlObj.searchParams.get("holiday") || undefined,
    duration: urlObj.searchParams.get("duration") || undefined,
    airport: urlObj.searchParams.get("airport") || undefined,
    date: urlObj.searchParams.get("date") || undefined,
    occupancy: urlObj.searchParams.get("occupancy") || undefined,
    board: urlObj.searchParams.get("board") || undefined,
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
 * Get airport code from Jet2 airport ID
 */
function getAirportCode(airportId: string | undefined): string | null {
  if (!airportId) return null;
  const id = parseInt(airportId, 10);
  for (const [code, numId] of Object.entries(JET2_AIRPORTS)) {
    if (numId === id) return code;
  }
  return null;
}

/**
 * Extract location from URL path
 * e.g., /beach/greece/zante/tsilivi/contessina-hotel -> { country: 'greece', resort: 'tsilivi' }
 */
function extractLocationFromPath(url: string): {
  country: string | null;
  resort: string | null;
  destination: string | null;
} {
  const urlObj = new URL(url);
  const parts = urlObj.pathname.split("/").filter(Boolean);
  // Typical structure: /beach/country/island/resort/hotel-name
  // or: /city/country/city/hotel-name

  let country: string | null = null;
  let resort: string | null = null;
  let destination: string | null = null;

  if (parts.length >= 3) {
    country = parts[1] || null; // e.g., 'greece'
    destination = parts[2] || null; // e.g., 'zante'
    resort = parts.length >= 4 ? parts[3] : null; // e.g., 'tsilivi'
  }

  return {
    country: country ? country.charAt(0).toUpperCase() + country.slice(1) : null,
    resort: resort
      ? resort
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      : null,
    destination: destination
      ? destination.charAt(0).toUpperCase() + destination.slice(1)
      : null,
  };
}

/**
 * Scrape a single Jet2 holiday deal page
 */
export async function scrapeJet2DealPage(url: string): Promise<Partial<NewDeal> | null> {
  try {
    const { html, status } = await fetchPage(url);

    console.log(`[Jet2 Scraper] Fetched ${url} - Status: ${status}, HTML length: ${html.length}`);

    if (status !== 200) {
      console.error(`Failed to fetch ${url}: status ${status}`);
      return null;
    }

    // Debug: Check if we got blocked or got a different page
    if (html.includes("Access Denied") || html.includes("blocked") || html.length < 10000) {
      console.error(`[Jet2 Scraper] Possibly blocked - HTML preview: ${html.substring(0, 500)}`);
    }

    const $ = parseHtml(html);
    const params = parseJet2Url(url);
    const location = extractLocationFromPath(url);

    // Extract JSON-LD data
    let jsonLdData: JsonLdHotel | undefined;
    const jsonLdScripts = $('script[type="application/ld+json"]');
    for (let i = 0; i < jsonLdScripts.length; i++) {
      try {
        const scriptContent = $(jsonLdScripts[i]).html();
        if (scriptContent) {
          const data = JSON.parse(scriptContent);
          if (data["@type"] === "Hotel") {
            jsonLdData = data as JsonLdHotel;
            break;
          }
        }
      } catch {
        // Ignore parse errors
      }
    }

    // Extract hotel name
    const hotelName =
      jsonLdData?.name || cleanText($("h1").first().text()) || "Unknown Hotel";

    // Extract image URL
    let imageUrl: string | null = jsonLdData?.image || null;
    if (!imageUrl) {
      const ogImage = $('meta[property="og:image"]').attr("content");
      if (ogImage) imageUrl = ogImage;
    }

    // Extract star rating
    const starRating = jsonLdData?.starRating?.ratingValue
      ? parseFloat(jsonLdData.starRating.ratingValue)
      : null;

    // Extract prices from the page
    // Look for the main price display
    let totalPrice: number | null = null;
    let pricePerPerson: number | null = null;
    let originalPrice: number | null = null;

    // Find price elements - Jet2 typically shows "Payable to Jet2holidays £X,XXX"
    const priceText = $("body").text();

    // Match "Payable to Jet2holidays £X,XXX" or similar total price
    const totalMatch = priceText.match(/Payable to Jet2holidays[^£]*£([\d,]+)/i);
    if (totalMatch) {
      totalPrice = parsePrice(totalMatch[1]);
    }

    // Match "Price per person £X,XXX"
    const ppMatch = priceText.match(/Price per person[^£]*£([\d,]+)/i);
    if (ppMatch) {
      pricePerPerson = parsePrice(ppMatch[1]);
    }

    // Match "Base price £X,XXX" for original price
    const baseMatch = priceText.match(/Base price[^£]*£([\d,]+)/i);
    if (baseMatch) {
      originalPrice = parsePrice(baseMatch[1]);
    }

    // If we couldn't find total but have per person, calculate total (assuming 2 adults)
    if (!totalPrice && pricePerPerson) {
      totalPrice = pricePerPerson * 2;
    }

    // Extract board basis
    const boardId = params.board ? parseInt(params.board, 10) : null;
    const boardBasis = boardId ? JET2_BOARD_BASIS[boardId] || null : null;

    // Parse dates
    const departureDate = parseJet2Date(params.date);
    const duration = params.duration ? parseInt(params.duration, 10) : null;
    let returnDate: string | null = null;
    if (departureDate && duration) {
      const depDate = new Date(departureDate);
      depDate.setDate(depDate.getDate() + duration);
      returnDate = depDate.toISOString().split("T")[0];
    }

    // Build destination string
    const destinationParts = [location.resort, location.destination, location.country]
      .filter(Boolean)
      .join(", ");

    console.log(`[Jet2 Scraper] Extracted data:`, {
      hotelName,
      destination: destinationParts,
      totalPrice,
      pricePerPerson,
      boardBasis,
      jsonLdFound: !!jsonLdData,
    });

    const deal: Partial<NewDeal> = {
      title: hotelName,
      destination: destinationParts || location.country || "Unknown",
      country: location.country,
      resort: location.resort,
      price: totalPrice || 0,
      pricePerPerson,
      originalPrice,
      currency: "GBP",
      departureAirport: getAirportCode(params.airport),
      departureDate,
      returnDate,
      duration,
      hotelName,
      hotelRating: starRating,
      boardBasis,
      imageUrl,
      url,
      rawData: JSON.stringify({ params, jsonLd: jsonLdData, location }),
    };

    return deal;
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return null;
  }
}

/**
 * Build a Jet2 search URL for Belfast departures
 */
export function buildJet2SearchUrl(options: {
  destination?: string;
  departureDate?: string;
  duration?: number;
  adults?: number;
  children?: number;
}): string {
  const {
    destination = "",
    departureDate = "",
    duration = 7,
    adults = 2,
    children = 0,
  } = options;

  // Format: r{adults}c{children count}{ages}
  // e.g., r2c = 2 adults, no children
  // e.g., r2c2-5-8 = 2 adults, 2 children aged 5 and 8
  let occupancy = `r${adults}c`;
  if (children > 0) {
    // Default children ages if not specified
    occupancy += Array(children).fill("10").join("-");
  }

  const params = new URLSearchParams({
    airport: String(JET2_AIRPORTS.BFS), // Belfast International
    duration: String(duration),
    occupancy,
  });

  if (departureDate) {
    // Convert from YYYY-MM-DD to DD-MM-YYYY
    const [year, month, day] = departureDate.split("-");
    params.set("date", `${day}-${month}-${year}`);
  }

  // Base search URL structure
  const baseUrl = destination
    ? `${JET2_BASE_URL}/destinations/${destination.toLowerCase()}`
    : `${JET2_BASE_URL}/search`;

  return `${baseUrl}?${params.toString()}`;
}
