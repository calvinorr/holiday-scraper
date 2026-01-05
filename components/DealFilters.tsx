"use client";

import { useState, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";

interface DealFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  destinations: string[];
  boardTypes: string[];
}

export interface FilterState {
  destination: string | null;
  minPrice: string;
  maxPrice: string;
  boardBasis: string | null;
  sortBy: string;
  sortOrder: string;
}

const defaultFilters: FilterState = {
  destination: null,
  minPrice: "",
  maxPrice: "",
  boardBasis: null,
  sortBy: "createdAt",
  sortOrder: "desc",
};

const sortOptions = [
  { value: "createdAt-desc", label: "Newest First" },
  { value: "createdAt-asc", label: "Oldest First" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "hotelRating-desc", label: "Rating: High to Low" },
  { value: "departureDate-asc", label: "Departure: Soonest" },
];

export function DealFilters({ onFilterChange, destinations, boardTypes }: DealFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  function updateFilter<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function handleSortChange(value: string) {
    const [sortBy, sortOrder] = value.split("-");
    setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
    setSortOpen(false);
  }

  function clearFilters() {
    setFilters(defaultFilters);
  }

  const hasActiveFilters =
    filters.destination ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.boardBasis ||
    filters.sortBy !== "createdAt" ||
    filters.sortOrder !== "desc";

  const currentSort = sortOptions.find(
    (opt) => opt.value === `${filters.sortBy}-${filters.sortOrder}`
  );

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6 space-y-4">
      {/* Destination Chips */}
      {destinations.length > 0 && (
        <div>
          <label className="block text-xs font-medium text-zinc-400 mb-2">Destination</label>
          <div className="flex flex-wrap gap-2">
            {destinations.map((dest) => (
              <button
                key={dest}
                onClick={() =>
                  updateFilter("destination", filters.destination === dest ? null : dest)
                }
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filters.destination === dest
                    ? "bg-emerald-600 text-white"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                {dest}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Range & Board Basis Row */}
      <div className="flex flex-wrap gap-4">
        {/* Price Range */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-zinc-400 mb-2">Price Range</label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
                £
              </span>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => updateFilter("minPrice", e.target.value)}
                placeholder="Min"
                min="0"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-7 pr-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <span className="text-zinc-500">-</span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
                £
              </span>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => updateFilter("maxPrice", e.target.value)}
                placeholder="Max"
                min="0"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-7 pr-3 py-2 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Board Basis */}
        {boardTypes.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">Board Basis</label>
            <div className="flex flex-wrap gap-2">
              {boardTypes.map((board) => (
                <button
                  key={board}
                  onClick={() =>
                    updateFilter("boardBasis", filters.boardBasis === board ? null : board)
                  }
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    filters.boardBasis === board
                      ? "bg-emerald-600 text-white"
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  }`}
                >
                  {board}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sort & Clear Row */}
      <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => setSortOpen(!sortOpen)}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm hover:bg-zinc-700 transition-colors"
          >
            <span className="text-zinc-400">Sort:</span>
            <span>{currentSort?.label || "Newest First"}</span>
            <ChevronDown
              className={`w-4 h-4 text-zinc-400 transition-transform ${sortOpen ? "rotate-180" : ""}`}
            />
          </button>

          {sortOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
              <div className="absolute left-0 top-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg py-1 min-w-[180px] z-20 shadow-xl">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-zinc-700 transition-colors ${
                      option.value === `${filters.sortBy}-${filters.sortOrder}`
                        ? "text-emerald-400"
                        : "text-zinc-300"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
