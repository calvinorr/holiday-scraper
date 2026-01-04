# Plan: feat-frontend-deals

## Phase 1: Deal Detail Page

- [x] Create GET /api/deals/[id] route for single deal fetch <!-- commit: feat: add single deal API route -->
- [x] Create /deal/[id]/page.tsx with full deal display <!-- commit: feat: add deal detail page -->
- [x] Update deal cards to link to /deal/[id] instead of external URL <!-- commit: refactor: link cards to detail page -->

## Phase 2: Component Extraction

- [x] Extract DealCard component from page.tsx <!-- commit: refactor: extract DealCard component -->
- [x] Extract Header component <!-- commit: refactor: extract Header component -->
- [x] Create PriceDisplay component with savings badge <!-- commit: feat: add PriceDisplay component -->

## Phase 3: Search & Filtering

- [ ] Add destination search input with autocomplete <!-- commit: feat: add destination search -->
- [ ] Add price range filter (min/max inputs or slider) <!-- commit: feat: add price range filter -->
- [ ] Add board basis filter chips <!-- commit: feat: add board basis filter -->
- [ ] Add sort dropdown (price, date, rating) <!-- commit: feat: add sort functionality -->
- [ ] Update /api/deals to support all filter params <!-- commit: feat: extend deals API with filters -->

## Phase 4: Polish

- [ ] Ensure mobile responsive layout <!-- commit: style: improve mobile responsiveness -->
- [ ] Add loading skeletons for better UX <!-- commit: feat: add loading skeletons -->
- [ ] Test and verify all filters work together <!-- commit: test: verify filter combinations -->

---

**Track ID**: feat-frontend-deals
**Created**: 2026-01-04
**Status**: In Progress
