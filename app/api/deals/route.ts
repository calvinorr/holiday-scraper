import { NextRequest, NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { eq, desc, asc, gte, lte, like, and, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
    const offset = (page - 1) * limit;

    // Filters
    const destination = searchParams.get("destination");
    const country = searchParams.get("country");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const departureAirport = searchParams.get("airport");
    const boardBasis = searchParams.get("board");
    const minDuration = searchParams.get("minDuration");
    const maxDuration = searchParams.get("maxDuration");

    // Sorting
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Build conditions array
    const conditions = [];

    if (destination) {
      conditions.push(like(schema.deals.destination, `%${destination}%`));
    }

    if (country) {
      conditions.push(eq(schema.deals.country, country));
    }

    if (minPrice) {
      conditions.push(gte(schema.deals.price, parseFloat(minPrice)));
    }

    if (maxPrice) {
      conditions.push(lte(schema.deals.price, parseFloat(maxPrice)));
    }

    if (departureAirport) {
      conditions.push(eq(schema.deals.departureAirport, departureAirport));
    }

    if (boardBasis) {
      conditions.push(eq(schema.deals.boardBasis, boardBasis));
    }

    if (minDuration) {
      conditions.push(gte(schema.deals.duration, parseInt(minDuration, 10)));
    }

    if (maxDuration) {
      conditions.push(lte(schema.deals.duration, parseInt(maxDuration, 10)));
    }

    // Get sort column
    const sortColumn = {
      price: schema.deals.price,
      pricePerPerson: schema.deals.pricePerPerson,
      duration: schema.deals.duration,
      departureDate: schema.deals.departureDate,
      hotelRating: schema.deals.hotelRating,
      createdAt: schema.deals.createdAt,
    }[sortBy] || schema.deals.createdAt;

    const orderFn = sortOrder === "asc" ? asc : desc;

    // Execute query
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [deals, countResult] = await Promise.all([
      db
        .select()
        .from(schema.deals)
        .where(whereClause)
        .orderBy(orderFn(sortColumn))
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(schema.deals)
        .where(whereClause),
    ]);

    const total = countResult[0]?.count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: deals,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching deals:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch deals" },
      { status: 500 }
    );
  }
}
