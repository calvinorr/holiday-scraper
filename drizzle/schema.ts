import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

// Hotels table - managed hotel information
export const hotels = sqliteTable("hotels", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  destination: text("destination").notNull(), // e.g., "Tenerife"
  country: text("country"), // e.g., "Spain"
  resort: text("resort"), // e.g., "Costa Adeje"
  rating: real("rating"), // star rating (1-5)
  description: text("description"),
  imageUrl: text("image_url"),
  amenities: text("amenities"), // JSON array of amenity strings
  address: text("address"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

// Providers table - travel sites we scrape from
export const providers = sqliteTable("providers", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  baseUrl: text("base_url").notNull(),
  logoUrl: text("logo_url"),
  departureAirport: text("departure_airport"), // e.g., "BFS" for Belfast International
  active: integer("active", { mode: "boolean" }).default(true),
  lastScrapedAt: text("last_scraped_at"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

// Deals table - scraped holiday deals
export const deals = sqliteTable("deals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  providerId: integer("provider_id").references(() => providers.id),

  // Core deal info
  title: text("title").notNull(),
  destination: text("destination").notNull(),
  country: text("country"),
  resort: text("resort"),

  // Pricing
  price: real("price").notNull(),
  pricePerPerson: real("price_per_person"),
  originalPrice: real("original_price"),
  currency: text("currency").default("GBP"),

  // Travel details
  departureAirport: text("departure_airport"), // e.g., "BFS"
  departureDate: text("departure_date"),
  returnDate: text("return_date"),
  duration: integer("duration"), // nights

  // Accommodation
  hotelId: integer("hotel_id").references(() => hotels.id),
  hotelName: text("hotel_name"), // kept for backward compatibility
  hotelRating: real("hotel_rating"), // star rating
  boardBasis: text("board_basis"), // e.g., "All Inclusive", "Half Board"

  // Media & links
  imageUrl: text("image_url"),
  images: text("images"), // JSON array of image URLs
  url: text("url").notNull(),

  // Metadata
  description: text("description"),
  amenities: text("amenities"), // JSON array of amenity strings
  reviewScore: real("review_score"), // e.g., 4.5 out of 5
  reviewCount: integer("review_count"),
  reviews: text("reviews"), // JSON array of review objects
  rawData: text("raw_data"), // JSON string of original scraped data
  scrapeJobId: integer("scrape_job_id").references(() => scrapeJobs.id),

  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

// Scrape jobs table - track scraping runs
export const scrapeJobs = sqliteTable("scrape_jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  providerId: integer("provider_id").references(() => providers.id),

  status: text("status").notNull().default("pending"), // pending, running, completed, failed

  // Stats
  dealsFound: integer("deals_found").default(0),
  dealsNew: integer("deals_new").default(0),
  dealsUpdated: integer("deals_updated").default(0),

  // Timing
  startedAt: text("started_at"),
  completedAt: text("completed_at"),

  // Debugging
  errorMessage: text("error_message"),
  rawHtml: text("raw_html"), // store for debugging failed parses

  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

// Type exports
export type Hotel = typeof hotels.$inferSelect;
export type NewHotel = typeof hotels.$inferInsert;
export type Provider = typeof providers.$inferSelect;
export type NewProvider = typeof providers.$inferInsert;
export type Deal = typeof deals.$inferSelect;
export type NewDeal = typeof deals.$inferInsert;
export type ScrapeJob = typeof scrapeJobs.$inferSelect;
export type NewScrapeJob = typeof scrapeJobs.$inferInsert;
