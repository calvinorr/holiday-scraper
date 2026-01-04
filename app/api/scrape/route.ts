import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { scrapeJet2WithPuppeteer, closeBrowser } from "@/lib/scrapers/jet2-puppeteer";
import { eq } from "drizzle-orm";
import { z } from "zod";

const scrapeRequestSchema = z.object({
  urls: z.array(z.string().url()).min(1).max(50),
  providerId: z.number().optional(),
});

// Ensure Jet2 provider exists and return its ID
async function ensureJet2Provider(): Promise<number> {
  const existing = await db.query.providers.findFirst({
    where: eq(schema.providers.slug, "jet2"),
  });

  if (existing) return existing.id;

  const [provider] = await db
    .insert(schema.providers)
    .values({
      name: "Jet2holidays",
      slug: "jet2",
      baseUrl: "https://www.jet2holidays.com",
      logoUrl: "https://www.jet2holidays.com/images/logos/jet2holidays-logo.svg",
      departureAirport: "BFS",
      active: true,
      createdAt: new Date().toISOString(),
    })
    .returning();

  return provider.id;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { urls, providerId: requestProviderId } = scrapeRequestSchema.parse(body);

    // Get or create provider
    const providerId = requestProviderId ?? (await ensureJet2Provider());

    // Create scrape job
    const [job] = await db
      .insert(schema.scrapeJobs)
      .values({
        providerId,
        status: "running",
        startedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      })
      .returning();

    const results: {
      url: string;
      success: boolean;
      dealId?: number;
      error?: string;
    }[] = [];

    let dealsFound = 0;
    let dealsNew = 0;

    // Scrape each URL using Puppeteer
    for (const url of urls) {
      try {
        const scrapeResult = await scrapeJet2WithPuppeteer(url);

        if (!scrapeResult.success || !scrapeResult.deal) {
          results.push({ url, success: false, error: scrapeResult.error || "Scrape failed" });
          continue;
        }

        const dealData = scrapeResult.deal;

        // Validate required fields
        if (
          !dealData.title ||
          !dealData.destination ||
          !dealData.price ||
          !dealData.url
        ) {
          results.push({ url, success: false, error: "Missing required deal data" });
          continue;
        }

        // Build validated deal object with required fields
        const validatedDeal = {
          title: dealData.title,
          destination: dealData.destination,
          price: dealData.price,
          url: dealData.url,
          country: dealData.country ?? null,
          resort: dealData.resort ?? null,
          pricePerPerson: dealData.pricePerPerson ?? null,
          originalPrice: dealData.originalPrice ?? null,
          currency: dealData.currency ?? "GBP",
          departureAirport: dealData.departureAirport ?? null,
          departureDate: dealData.departureDate ?? null,
          returnDate: dealData.returnDate ?? null,
          duration: dealData.duration ?? null,
          hotelName: dealData.hotelName ?? null,
          hotelRating: dealData.hotelRating ?? null,
          boardBasis: dealData.boardBasis ?? null,
          imageUrl: dealData.imageUrl ?? null,
          description: dealData.description ?? null,
          rawData: dealData.rawData ?? null,
        };

        // Check if deal already exists (by URL)
        const existing = await db.query.deals.findFirst({
          where: eq(schema.deals.url, url),
        });

        if (existing) {
          // Update existing deal
          await db
            .update(schema.deals)
            .set({
              ...validatedDeal,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(schema.deals.id, existing.id));

          results.push({ url, success: true, dealId: existing.id });
          dealsFound++;
        } else {
          // Insert new deal
          const [newDeal] = await db
            .insert(schema.deals)
            .values({
              ...validatedDeal,
              providerId,
              scrapeJobId: job.id,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })
            .returning();

          results.push({ url, success: true, dealId: newDeal.id });
          dealsFound++;
          dealsNew++;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        results.push({ url, success: false, error: message });
      }
    }

    // Update job status
    await db
      .update(schema.scrapeJobs)
      .set({
        status: "completed",
        completedAt: new Date().toISOString(),
        dealsFound,
        dealsNew,
        dealsUpdated: dealsFound - dealsNew,
      })
      .where(eq(schema.scrapeJobs.id, job.id));

    // Update provider lastScrapedAt
    await db
      .update(schema.providers)
      .set({ lastScrapedAt: new Date().toISOString() })
      .where(eq(schema.providers.id, providerId));

    // Close browser after scraping
    await closeBrowser();

    return NextResponse.json({
      success: true,
      jobId: job.id,
      summary: {
        total: urls.length,
        successful: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
        dealsNew,
      },
      results,
    });
  } catch (error) {
    console.error("Scrape error:", error);
    await closeBrowser();

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid request", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET: Check scrape job status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    // Return recent jobs
    const jobs = await db.query.scrapeJobs.findMany({
      orderBy: (jobs, { desc }) => [desc(jobs.createdAt)],
      limit: 10,
    });
    return NextResponse.json({ jobs });
  }

  const job = await db.query.scrapeJobs.findFirst({
    where: eq(schema.scrapeJobs.id, parseInt(jobId, 10)),
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({ job });
}
