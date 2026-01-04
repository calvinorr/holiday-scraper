# Track: feat-frontend-deals

## Objective
Build a polished frontend for browsing and viewing holiday deals, with search/filter capabilities.

## Scope

### Deal Detail Page
- Route: `/deal/[id]`
- Full deal info: images, hotel details, pricing breakdown, dates
- "Book on Jet2" button (external link)
- Back to listings navigation

### Search & Filtering
- Destination search (autocomplete from existing deals)
- Price range slider
- Date range picker (departure dates)
- Board basis filter chips
- Sort by: price, date, rating

### Component Extraction
- `DealCard` - reusable deal card component
- `SearchBar` - sticky search/filter bar
- `Header` - app header with nav
- `PriceDisplay` - formatted price with savings badge

## Out of Scope
- Gemini AI integration
- Additional providers
- User accounts/favorites

## Technical Decisions

### Routing
- App Router with dynamic `[id]` segment
- Server components for initial data fetch
- Client components for interactivity

### State
- URL search params for filters (shareable URLs)
- React state for UI interactions

### API
- Extend `/api/deals` with filter query params
- Add `/api/deals/[id]` for single deal

## Acceptance Criteria
- [ ] Clicking a deal card opens `/deal/[id]` with full details
- [ ] Search by destination filters the list
- [ ] Price range slider works
- [ ] Sort dropdown changes order
- [ ] Mobile responsive
