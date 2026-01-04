# Track: feat-db-scraping

## Objective
Build the database schema with Drizzle/Turso and implement core scraping infrastructure.

## Scope

### Database Schema
- **deals**: Store scraped holiday deals with pricing, dates, destinations
- **providers**: Track travel sites we scrape (name, URL, status)
- **scrapeJobs**: Log scraping runs for monitoring/debugging

### Scraping Infrastructure
- Drizzle client setup with Turso connection
- Cheerio-based scraper utilities
- API route to trigger scrapes
- Sample scraper for one provider (TUI or similar)

## Out of Scope (Future Tracks)
- Gemini AI integration
- Frontend UI components
- Search/filtering
- Multiple provider scrapers

## Technical Decisions

### Database
- Use Drizzle ORM with `@libsql/client`
- Timestamps as ISO strings (SQLite compatible)
- Soft deletes via `active` flag on providers

### Scraping
- Server-side only (API routes)
- Rate limiting built into scraper
- Store raw HTML for debugging failed parses

## Acceptance Criteria
- [ ] Database schema created and pushed to Turso
- [ ] Can insert/query deals programmatically
- [ ] Scraper can fetch and parse a real holiday listing page
- [ ] API route triggers scrape and stores results
