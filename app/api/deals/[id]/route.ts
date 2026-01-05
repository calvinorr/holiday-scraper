import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const dealId = parseInt(id, 10);

    if (isNaN(dealId)) {
      return NextResponse.json(
        { success: false, error: "Invalid deal ID" },
        { status: 400 }
      );
    }

    const deal = await db.query.deals.findFirst({
      where: eq(schema.deals.id, dealId),
    });

    if (!deal) {
      return NextResponse.json(
        { success: false, error: "Deal not found" },
        { status: 404 }
      );
    }

    // Also fetch provider info
    let provider = null;
    if (deal.providerId) {
      provider = await db.query.providers.findFirst({
        where: eq(schema.providers.id, deal.providerId),
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...deal,
        provider,
      },
    });
  } catch (error) {
    console.error("Error fetching deal:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch deal" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const dealId = parseInt(id, 10);

    if (isNaN(dealId)) {
      return NextResponse.json(
        { success: false, error: "Invalid deal ID" },
        { status: 400 }
      );
    }

    const existing = await db
      .select()
      .from(schema.deals)
      .where(eq(schema.deals.id, dealId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: "Deal not found" },
        { status: 404 }
      );
    }

    await db.delete(schema.deals).where(eq(schema.deals.id, dealId));

    return NextResponse.json({
      success: true,
      message: "Deal deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting deal:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete deal" },
      { status: 500 }
    );
  }
}
