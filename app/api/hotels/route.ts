import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { desc, asc, like, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
    const offset = (page - 1) * limit;

    // Search
    const search = searchParams.get("search");

    // Sorting
    const sortBy = searchParams.get("sortBy") || "name";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    // Build query
    const whereClause = search
      ? like(schema.hotels.name, `%${search}%`)
      : undefined;

    // Get sort column
    const sortColumn = {
      name: schema.hotels.name,
      destination: schema.hotels.destination,
      rating: schema.hotels.rating,
      createdAt: schema.hotels.createdAt,
    }[sortBy] || schema.hotels.name;

    const orderFn = sortOrder === "desc" ? desc : asc;

    const [hotels, countResult] = await Promise.all([
      db
        .select()
        .from(schema.hotels)
        .where(whereClause)
        .orderBy(orderFn(sortColumn))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.hotels)
        .where(whereClause),
    ]);

    const total = countResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: hotels,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching hotels:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch hotels" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, destination, country, resort, rating, description, imageUrl, amenities, address, latitude, longitude } = body;

    if (!name || !destination) {
      return NextResponse.json(
        { success: false, error: "Name and destination are required" },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const result = await db
      .insert(schema.hotels)
      .values({
        name,
        destination,
        country,
        resort,
        rating: rating ? parseFloat(rating) : null,
        description,
        imageUrl,
        amenities: amenities ? JSON.stringify(amenities) : null,
        address,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    console.error("Error creating hotel:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create hotel" },
      { status: 500 }
    );
  }
}
