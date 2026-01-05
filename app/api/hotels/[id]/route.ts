import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const hotelId = parseInt(id, 10);

    if (isNaN(hotelId)) {
      return NextResponse.json(
        { success: false, error: "Invalid hotel ID" },
        { status: 400 }
      );
    }

    const hotel = await db
      .select()
      .from(schema.hotels)
      .where(eq(schema.hotels.id, hotelId))
      .limit(1);

    if (hotel.length === 0) {
      return NextResponse.json(
        { success: false, error: "Hotel not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: hotel[0],
    });
  } catch (error) {
    console.error("Error fetching hotel:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch hotel" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const hotelId = parseInt(id, 10);

    if (isNaN(hotelId)) {
      return NextResponse.json(
        { success: false, error: "Invalid hotel ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, destination, country, resort, rating, description, imageUrl, amenities, address, latitude, longitude } = body;

    // Check hotel exists
    const existing = await db
      .select()
      .from(schema.hotels)
      .where(eq(schema.hotels.id, hotelId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: "Hotel not found" },
        { status: 404 }
      );
    }

    const result = await db
      .update(schema.hotels)
      .set({
        ...(name !== undefined && { name }),
        ...(destination !== undefined && { destination }),
        ...(country !== undefined && { country }),
        ...(resort !== undefined && { resort }),
        ...(rating !== undefined && { rating: rating ? parseFloat(rating) : null }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(amenities !== undefined && { amenities: amenities ? JSON.stringify(amenities) : null }),
        ...(address !== undefined && { address }),
        ...(latitude !== undefined && { latitude: latitude ? parseFloat(latitude) : null }),
        ...(longitude !== undefined && { longitude: longitude ? parseFloat(longitude) : null }),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.hotels.id, hotelId))
      .returning();

    return NextResponse.json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    console.error("Error updating hotel:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update hotel" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const hotelId = parseInt(id, 10);

    if (isNaN(hotelId)) {
      return NextResponse.json(
        { success: false, error: "Invalid hotel ID" },
        { status: 400 }
      );
    }

    // Check hotel exists
    const existing = await db
      .select()
      .from(schema.hotels)
      .where(eq(schema.hotels.id, hotelId))
      .limit(1);

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: "Hotel not found" },
        { status: 404 }
      );
    }

    await db.delete(schema.hotels).where(eq(schema.hotels.id, hotelId));

    return NextResponse.json({
      success: true,
      message: "Hotel deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting hotel:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete hotel" },
      { status: 500 }
    );
  }
}
