# Track: feat-frontend-deals

## Objective
Build a polished frontend for browsing and viewing holiday deals, with filtering and hotel management.

## Scope

### Deal Detail Page ✅
- Route: `/deal/[id]`
- Full deal info: images, hotel details, pricing breakdown, dates
- "Book on Jet2" button (external link)
- Back to listings navigation

### Filtering (simplified)
- Destination filter chips (from existing deals)
- Price range filter (min/max inputs)
- Board basis filter chips
- Sort by: price, date, rating

### Component Extraction ✅
- `DealCard` - reusable deal card component
- `Header` - app header with nav
- `PriceDisplay` - formatted price with savings badge

### Hotel Management (NEW)
- Separate `hotels` table (normalized from deals)
- Admin UI at `/admin/hotels`
- Full CRUD: list, create, edit, delete hotels
- Link hotels to deals via foreign key

## Out of Scope
- Gemini AI integration
- Additional providers
- User accounts/favorites

## Technical Decisions

### Routing
- App Router with dynamic `[id]` segment
- Server components for initial data fetch
- Client components for interactivity
- `/admin/*` routes for management UI

### State
- URL search params for filters (shareable URLs)
- React state for UI interactions

### API
- Extend `/api/deals` with filter query params
- `/api/deals/[id]` for single deal ✅
- `/api/hotels` - GET (list), POST (create)
- `/api/hotels/[id]` - GET, PUT, DELETE

### Database
- New `hotels` table with: id, name, location, rating, imageUrl, amenities
- Update `deals.hotelId` foreign key (migrate from hotelName)

## Acceptance Criteria
- [x] Clicking a deal card opens `/deal/[id]` with full details
- [ ] Destination filter chips work
- [ ] Price range filter works
- [ ] Sort dropdown changes order
- [ ] Mobile responsive
- [ ] Admin can list all hotels
- [ ] Admin can create new hotel
- [ ] Admin can edit existing hotel
- [ ] Admin can delete hotel
