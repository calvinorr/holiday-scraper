import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Schema for manually adding a deal
const manualDealSchema = z.object({
  title: z.string().min(1),
  destination: z.string().min(1),
  country: z.string().optional(),
  resort: z.string().optional(),
  price: z.number().positive(),
  pricePerPerson: z.number().positive().optional(),
  originalPrice: z.number().positive().optional(),
  currency: z.string().default("GBP"),
  departureAirport: z.string().optional(),
  departureDate: z.string().optional(),
  returnDate: z.string().optional(),
  duration: z.number().int().positive().optional(),
  hotelName: z.string().optional(),
  hotelRating: z.number().min(0).max(5).optional(),
  boardBasis: z.string().optional(),
  imageUrl: z.string().url().optional(),
  url: z.string().url(),
  description: z.string().optional(),
});

// Ensure Jet2 provider exists
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
    const dealData = manualDealSchema.parse(body);

    const providerId = await ensureJet2Provider();

    // Check if deal already exists
    const existing = await db.query.deals.findFirst({
      where: eq(schema.deals.url, dealData.url),
    });

    if (existing) {
      // Update existing
      await db
        .update(schema.deals)
        .set({
          ...dealData,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(schema.deals.id, existing.id));

      return NextResponse.json({
        success: true,
        message: "Deal updated",
        dealId: existing.id,
      });
    }

    // Insert new deal
    const [newDeal] = await db
      .insert(schema.deals)
      .values({
        ...dealData,
        providerId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Deal created",
      dealId: newDeal.id,
    });
  } catch (error) {
    console.error("Manual deal error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid deal data", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
