# Plan: feat-db-scraping

## Phase 1: Database Setup

- [x] Create Drizzle schema file with deals, providers, scrapeJobs tables <!-- commit: feat: add drizzle schema -->
- [x] Create database client connection (lib/db.ts) <!-- commit: feat: add database client -->
- [x] Add drizzle.config.ts for migrations <!-- commit: chore: add drizzle config -->
- [x] Push schema to Turso database <!-- commit: chore: push initial schema -->

## Phase 2: Scraping Core

- [x] Create scraper utilities (lib/scraper.ts) with fetch + cheerio helpers <!-- commit: feat: add scraper utilities -->
- [x] Build Jet2 scraper for Belfast International (lib/scrapers/jet2.ts) <!-- commit: feat: add jet2 scraper -->
- [x] Create POST /api/scrape route to trigger scraping <!-- commit: feat: add scrape api route -->
- [x] Create GET /api/deals route to list deals <!-- commit: feat: add deals api route -->
- [x] Create POST /api/deals/manual route for manual deal entry <!-- commit: feat: add manual deal entry -->

## Phase 3: Puppeteer Integration

- [x] Install Puppeteer for headless browser scraping <!-- commit: feat: add puppeteer -->
- [x] Create Puppeteer-based Jet2 scraper (lib/scrapers/jet2-puppeteer.ts) <!-- commit: feat: add puppeteer scraper -->
- [x] Update scrape API to use Puppeteer <!-- commit: refactor: use puppeteer for scraping -->
- [x] Test automated scraping - SUCCESS <!-- commit: test: verify puppeteer scraping -->

---

**Track ID**: feat-db-scraping
**Created**: 2026-01-04
**Status**: Completed

## Notes

- **Puppeteer Solution**: Server-side fetch was blocked by Jet2's anti-bot. Puppeteer uses a real Chromium browser to bypass this.
- **Database**: Turso DB `holiday-scraper-db` in eu-west-1
- **Belfast Focus**: Airport code BFS (Belfast International) is the default departure airport
- **Tested Successfully**: Scraped Contessina Hotel deal with full data extraction (price, dates, rating, board basis, images)

## API Usage

```bash
# Scrape a Jet2 deal URL
curl -X POST http://localhost:3002/api/scrape \
  -H "Content-Type: application/json" \
  -d '{"urls": ["https://www.jet2holidays.com/..."]}'

# List all deals
curl http://localhost:3002/api/deals

# Filter deals
curl "http://localhost:3002/api/deals?country=Greece&minPrice=1000&maxPrice=3000"
```
