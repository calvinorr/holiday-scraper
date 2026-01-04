"use client";

import { useState, useEffect } from "react";
import { Plane, Loader2, ExternalLink, Star, Calendar, Users, Utensils } from "lucide-react";

interface Deal {
  id: number;
  title: string;
  destination: string;
  country: string | null;
  resort: string | null;
  price: number;
  pricePerPerson: number | null;
  originalPrice: number | null;
  currency: string;
  departureAirport: string | null;
  departureDate: string | null;
  returnDate: string | null;
  duration: number | null;
  hotelName: string | null;
  hotelRating: number | null;
  boardBasis: string | null;
  imageUrl: string | null;
  url: string;
  createdAt: string;
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loadingDeals, setLoadingDeals] = useState(true);

  // Fetch deals on mount
  useEffect(() => {
    fetchDeals();
  }, []);

  async function fetchDeals() {
    try {
      const res = await fetch("/api/deals");
      const data = await res.json();
      if (data.success) {
        setDeals(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch deals:", error);
    } finally {
      setLoadingDeals(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: [url.trim()] }),
      });

      const data = await res.json();

      if (data.success && data.summary.successful > 0) {
        setMessage({ type: "success", text: "Deal scraped and saved!" });
        setUrl("");
        fetchDeals(); // Refresh deals list
      } else {
        const error = data.results?.[0]?.error || "Failed to scrape deal";
        setMessage({ type: "error", text: error });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
      minimumFractionDigits: 0,
    }).format(price);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <Plane className="w-6 h-6 text-emerald-500" />
          <h1 className="text-xl font-semibold tracking-tight">Holiday Scraper</h1>
          <span className="text-sm text-zinc-500 ml-auto">Belfast (BFS)</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* URL Input Form */}
        <section className="mb-10">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-lg font-medium mb-4">Add a Jet2 Holiday</h2>
            <p className="text-sm text-zinc-400 mb-4">
              Browse <a href="https://www.jet2holidays.com" target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:underline">jet2holidays.com</a>, find a deal you like, and paste the URL below.
            </p>

            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.jet2holidays.com/beach/greece/..."
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !url.trim()}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Scraping...
                  </>
                ) : (
                  "Add Deal"
                )}
              </button>
            </form>

            {message && (
              <div
                className={`mt-4 px-4 py-3 rounded-lg text-sm ${
                  message.type === "success"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}
              >
                {message.text}
              </div>
            )}
          </div>
        </section>

        {/* Deals List */}
        <section>
          <h2 className="text-lg font-medium mb-4">
            Saved Deals {deals.length > 0 && <span className="text-zinc-500">({deals.length})</span>}
          </h2>

          {loadingDeals ? (
            <div className="text-center py-12 text-zinc-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Loading deals...
            </div>
          ) : deals.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 bg-zinc-900/50 rounded-xl border border-zinc-800">
              <Plane className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p>No deals saved yet.</p>
              <p className="text-sm mt-1">Add a Jet2 URL above to get started.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {deals.map((deal) => (
                <div
                  key={deal.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors"
                >
                  {/* Image */}
                  {deal.imageUrl && (
                    <div className="aspect-video bg-zinc-800 relative">
                      <img
                        src={deal.imageUrl}
                        alt={deal.title}
                        className="w-full h-full object-cover"
                      />
                      {deal.originalPrice && deal.originalPrice > deal.price && (
                        <span className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-medium px-2 py-1 rounded">
                          Save {formatPrice(deal.originalPrice - deal.price)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg leading-tight mb-1">
                      {deal.title}
                    </h3>
                    <p className="text-sm text-zinc-400 mb-3">{deal.destination}</p>

                    {/* Details */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400 mb-4">
                      {deal.hotelRating && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          {deal.hotelRating} star
                        </span>
                      )}
                      {deal.duration && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {deal.duration} nights
                        </span>
                      )}
                      {deal.boardBasis && (
                        <span className="flex items-center gap-1">
                          <Utensils className="w-3 h-3" />
                          {deal.boardBasis}
                        </span>
                      )}
                    </div>

                    {/* Date */}
                    {deal.departureDate && (
                      <p className="text-sm text-zinc-400 mb-3">
                        {formatDate(deal.departureDate)}
                        {deal.returnDate && ` - ${formatDate(deal.returnDate)}`}
                      </p>
                    )}

                    {/* Price */}
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-2xl font-bold text-emerald-400">
                          {formatPrice(deal.price)}
                        </p>
                        {deal.pricePerPerson && (
                          <p className="text-xs text-zinc-500">
                            {formatPrice(deal.pricePerPerson)} pp
                          </p>
                        )}
                      </div>
                      <a
                        href={deal.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-zinc-400 hover:text-white flex items-center gap-1"
                      >
                        View <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
