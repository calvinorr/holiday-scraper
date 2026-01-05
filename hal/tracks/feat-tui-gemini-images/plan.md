# Plan: feat-tui-gemini-images

## Phase 1: TUI Scraper

- [ ] Research TUI website structure and data format <!-- commit: research: analyze TUI website -->
- [ ] Create TUI Puppeteer scraper (lib/scrapers/tui-puppeteer.ts) <!-- commit: feat: add TUI scraper -->
- [ ] Ensure TUI provider exists in database <!-- commit: feat: add TUI provider -->
- [ ] Test TUI scraping with sample URLs <!-- commit: test: verify TUI scraper -->
- [ ] Add provider filter to deals list UI <!-- commit: feat: add provider filter -->

## Phase 2: Gemini AI Integration

- [ ] Create Gemini service (lib/services/gemini.ts) <!-- commit: feat: add Gemini service -->
- [ ] Add AI fields to deals schema (aiDescription, aiCategory, aiHighlights) <!-- commit: feat: add AI fields to schema -->
- [ ] Process deals with Gemini after scraping <!-- commit: feat: integrate Gemini in scrape flow -->
- [ ] Display AI content on deal detail page <!-- commit: feat: show AI content on deals -->
- [ ] Add manual "Enhance with AI" button for existing deals <!-- commit: feat: add manual AI enhancement -->

## Phase 3: Image Improvements

- [ ] Evaluate image storage options (Cloudinary vs Vercel Blob) <!-- commit: research: image storage options -->
- [ ] Set up image optimization pipeline <!-- commit: feat: add image optimization -->
- [ ] Implement lazy loading for deal images <!-- commit: feat: add lazy loading -->
- [ ] Add image gallery component with thumbnails <!-- commit: feat: improve image gallery -->
- [ ] Cache/proxy external images for reliability <!-- commit: feat: add image caching -->

## Phase 4: Polish & Testing

- [ ] Add provider badges to deal cards <!-- commit: feat: add provider badges -->
- [ ] Test both providers end-to-end <!-- commit: test: verify both providers -->
- [ ] Performance audit (Lighthouse) <!-- commit: perf: optimize based on audit -->
- [ ] Update documentation <!-- commit: docs: update README -->

---

**Track ID**: feat-tui-gemini-images
**Created**: 2026-01-05
**Status**: Not Started
