# Technical Specifications

## Database Schema (Drizzle)

```typescript
// Tables
deals: id, title, destination, price, originalPrice, provider, url, imageUrl,
       departureDate, returnDate, duration, description, createdAt, updatedAt

providers: id, name, baseUrl, logoUrl, lastScraped, active

scrapeJobs: id, providerId, status, startedAt, completedAt, dealsFound, errors
```

## API Routes

```
GET  /api/deals          - List deals (with filters)
GET  /api/deals/[id]     - Get single deal
POST /api/scrape         - Trigger scrape job
GET  /api/scrape/status  - Get scrape job status
GET  /api/providers      - List providers
```

## Scraping Strategy

1. Queue-based scraping (avoid rate limits)
2. Store raw HTML for debugging
3. Use Cheerio for parsing
4. Gemini for extracting structured data from messy HTML

## Environment Variables

```
DATABASE_URL=libsql://...
DATABASE_AUTH_TOKEN=...
GEMINI_API_KEY=...
```

## File Structure

```
app/
  api/
    deals/route.ts
    scrape/route.ts
  page.tsx (deal listing)
  deal/[id]/page.tsx
lib/
  db.ts (drizzle client)
  scraper.ts (cheerio utils)
  ai.ts (gemini client)
drizzle/
  schema.ts
  migrations/
```
