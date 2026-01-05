# Track: feat-tui-gemini-images

## Objective
Add TUI as a second provider, integrate Gemini AI for deal enhancement, and improve image handling.

## Scope

### TUI Provider
- Scraper for TUI holidays (tui.co.uk)
- Same data model as Jet2 (destination, price, dates, hotel, etc.)
- Provider selection in UI

### Gemini AI Integration
- Auto-generate enhanced descriptions for deals
- Categorize deals (beach, city break, family, luxury, etc.)
- Extract/summarize key selling points
- Sentiment analysis on reviews

### Image Improvements
- Image optimization/compression
- Cloudinary or similar for CDN hosting
- Multiple image gallery on deal cards
- Lazy loading for performance

## Out of Scope
- User accounts
- Price alerts
- Booking integration

## Technical Decisions

### TUI Scraping
- Puppeteer (same as Jet2 - dynamic content)
- Map TUI data structure to existing deal schema
- Handle TUI-specific fields

### Gemini Integration
- Google Generative AI SDK (already installed)
- Process deals after scraping
- Store AI-generated content in separate fields
- Rate limiting to avoid API costs

### Image Storage Options
1. **Cloudinary** - Free tier, auto-optimization
2. **Vercel Blob** - Native integration
3. **Keep URLs** - Just proxy/cache external images

## Acceptance Criteria
- [ ] Can scrape TUI holidays
- [ ] Deals show provider badge (Jet2/TUI)
- [ ] AI-generated descriptions appear on deal pages
- [ ] Images load fast with proper optimization
