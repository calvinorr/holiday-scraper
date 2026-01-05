# Plan: feat-frontend-deals

## Phase 1: Deal Detail Page ✅

- [x] Create GET /api/deals/[id] route for single deal fetch <!-- commit: feat: add single deal API route -->
- [x] Create /deal/[id]/page.tsx with full deal display <!-- commit: feat: add deal detail page -->
- [x] Update deal cards to link to /deal/[id] instead of external URL <!-- commit: refactor: link cards to detail page -->

## Phase 2: Component Extraction ✅

- [x] Extract DealCard component from page.tsx <!-- commit: refactor: extract DealCard component -->
- [x] Extract Header component <!-- commit: refactor: extract Header component -->
- [x] Create PriceDisplay component with savings badge <!-- commit: feat: add PriceDisplay component -->

## Phase 3: Hotels Schema & CRUD

- [x] Add hotels table to schema with migration <!-- commit: feat: add hotels table schema -->
- [x] Create /api/hotels route (GET list, POST create) <!-- commit: feat: add hotels API routes -->
- [x] Create /api/hotels/[id] route (GET, PUT, DELETE) <!-- commit: feat: add single hotel API route -->
- [x] Create /admin/hotels page with list view <!-- commit: feat: add admin hotels list page -->
- [x] Add create hotel form/modal <!-- commit: feat: add hotel create form -->
- [x] Add edit hotel form/modal <!-- commit: feat: add hotel edit form -->
- [x] Add delete hotel with confirmation <!-- commit: feat: add hotel delete functionality -->

## Phase 4: Deal Filtering

- [x] Add destination filter chips (from existing deals) <!-- commit: feat: add deal filters -->
- [x] Add price range filter (min/max inputs) <!-- commit: feat: add deal filters -->
- [x] Add board basis filter chips <!-- commit: feat: add deal filters -->
- [x] Add sort dropdown (price, date, rating) <!-- commit: feat: add deal filters -->
- [x] Update /api/deals to support all filter params <!-- commit: already supported -->

## Phase 5: Polish

- [ ] Ensure mobile responsive layout <!-- commit: style: improve mobile responsiveness -->
- [ ] Add loading skeletons for better UX <!-- commit: feat: add loading skeletons -->

---

**Track ID**: feat-frontend-deals
**Created**: 2026-01-04
**Status**: In Progress
