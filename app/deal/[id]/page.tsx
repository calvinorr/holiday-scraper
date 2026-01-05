"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  ExternalLink,
  Star,
  Calendar,
  Utensils,
  Plane,
  MapPin,
  Clock,
  Building2,
  Check,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { Header } from "@/components/Header";
import { PriceDisplay } from "@/components/PriceDisplay";

interface Provider {
  id: number;
  name: string;
  logoUrl: string | null;
}

interface Review {
  rating?: number;
  text?: string;
  author?: string;
}

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
  images: string | null; // JSON array
  url: string;
  description: string | null;
  amenities: string | null; // JSON array
  reviewScore: number | null;
  reviewCount: number | null;
  reviews: string | null; // JSON array
  createdAt: string;
  provider: Provider | null;
}

export default function DealPage() {
  const params = useParams();
  const router = useRouter();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!deal) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/deals/${deal.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        router.push("/");
      } else {
        setError(data.error || "Failed to delete deal");
        setShowDeleteConfirm(false);
      }
    } catch {
      setError("Failed to delete deal");
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  }

  useEffect(() => {
    async function fetchDeal() {
      try {
        const res = await fetch(`/api/deals/${params.id}`);
        const data = await res.json();

        if (data.success) {
          setDeal(data.data);
        } else {
          setError(data.error || "Deal not found");
        }
      } catch {
        setError("Failed to load deal");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchDeal();
    }
  }, [params.id]);

  function formatDate(dateStr: string | null) {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  // Parse JSON arrays safely
  function parseJsonArray<T>(jsonStr: string | null): T[] {
    if (!jsonStr) return [];
    try {
      return JSON.parse(jsonStr);
    } catch {
      return [];
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (error || !deal) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-400">{error || "Deal not found"}</p>
        <button
          onClick={() => router.push("/")}
          className="text-emerald-500 hover:text-emerald-400 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to deals
        </button>
      </div>
    );
  }

  const savings =
    deal.originalPrice && deal.originalPrice > deal.price
      ? deal.originalPrice - deal.price
      : null;

  const images = parseJsonArray<string>(deal.images);
  const amenities = parseJsonArray<string>(deal.amenities);
  const reviews = parseJsonArray<Review>(deal.reviews);

  // Use images array or fall back to single imageUrl
  const allImages = images.length > 0 ? images : deal.imageUrl ? [deal.imageUrl] : [];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <Header
        title={deal.title}
        showBack
        rightContent={
          <div className="flex items-center gap-3">
            {deal.provider && (
              <span className="text-sm text-zinc-500">{deal.provider.name}</span>
            )}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
              title="Delete deal"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        }
      />

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Image Section */}
          <div className="space-y-4">
            {allImages.length > 0 ? (
              <div className="aspect-video rounded-xl overflow-hidden bg-zinc-800 relative">
                <img
                  src={allImages[currentImageIndex]}
                  alt={deal.title}
                  className="w-full h-full object-cover"
                />
                {savings && (
                  <PriceDisplay
                    savings={savings}
                    variant="badge"
                    className="absolute top-4 left-4 text-sm px-3 py-1.5 rounded-full"
                  />
                )}
                {/* Image navigation */}
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 p-2 rounded-full transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {allImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            idx === currentImageIndex
                              ? "bg-white"
                              : "bg-white/40 hover:bg-white/60"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="aspect-video rounded-xl bg-zinc-800 flex items-center justify-center">
                <Building2 className="w-16 h-16 text-zinc-600" />
              </div>
            )}

            {/* Quick Info Pills */}
            <div className="flex flex-wrap gap-2">
              {deal.hotelRating && (
                <span className="flex items-center gap-1.5 bg-zinc-800 border border-zinc-700 rounded-full px-3 py-1.5 text-sm">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  {deal.hotelRating} Star Hotel
                </span>
              )}
              {deal.boardBasis && (
                <span className="flex items-center gap-1.5 bg-zinc-800 border border-zinc-700 rounded-full px-3 py-1.5 text-sm">
                  <Utensils className="w-4 h-4 text-zinc-400" />
                  {deal.boardBasis}
                </span>
              )}
              {deal.duration && (
                <span className="flex items-center gap-1.5 bg-zinc-800 border border-zinc-700 rounded-full px-3 py-1.5 text-sm">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  {deal.duration} nights
                </span>
              )}
              {deal.reviewScore && (
                <span className="flex items-center gap-1.5 bg-zinc-800 border border-zinc-700 rounded-full px-3 py-1.5 text-sm">
                  <MessageSquare className="w-4 h-4 text-zinc-400" />
                  {deal.reviewScore}/5
                  {deal.reviewCount && (
                    <span className="text-zinc-500">({deal.reviewCount})</span>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Hotel Name & Location */}
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {deal.hotelName || deal.title}
              </h2>
              <p className="text-zinc-400 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {deal.destination}
              </p>
            </div>

            {/* Price Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <PriceDisplay
                price={deal.price}
                pricePerPerson={deal.pricePerPerson}
                originalPrice={deal.originalPrice}
                variant="large"
                className="mb-4"
              />
              <a
                href={deal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                Book on {deal.provider?.name || "Jet2"}
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Travel Details */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-lg">Travel Details</h3>

              {deal.departureAirport && (
                <div className="flex items-center gap-3">
                  <Plane className="w-5 h-5 text-zinc-400" />
                  <div>
                    <p className="text-sm text-zinc-500">Departing from</p>
                    <p className="font-medium">{deal.departureAirport}</p>
                  </div>
                </div>
              )}

              {deal.departureDate && (
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-zinc-400" />
                  <div>
                    <p className="text-sm text-zinc-500">Dates</p>
                    <p className="font-medium">
                      {formatDate(deal.departureDate)}
                      {deal.returnDate && (
                        <span className="text-zinc-400">
                          {" "}
                          to {formatDate(deal.returnDate)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {deal.duration && (
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-zinc-400" />
                  <div>
                    <p className="text-sm text-zinc-500">Duration</p>
                    <p className="font-medium">{deal.duration} nights</p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {deal.description && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-3">
                  About this holiday
                </h3>
                <p className="text-zinc-400 leading-relaxed whitespace-pre-line">
                  {deal.description}
                </p>
              </div>
            )}

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-4">
                  Amenities & Facilities
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {amenities.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-sm text-zinc-300"
                    >
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {(reviews.length > 0 || deal.reviewScore) && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Reviews</h3>
                  {deal.reviewScore && (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-emerald-400">
                        {deal.reviewScore}
                      </span>
                      <span className="text-zinc-500">/5</span>
                      {deal.reviewCount && (
                        <span className="text-sm text-zinc-500">
                          ({deal.reviewCount} reviews)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {reviews.length > 0 && (
                  <div className="space-y-4">
                    {reviews.map((review, idx) => (
                      <div
                        key={idx}
                        className="border-t border-zinc-800 pt-4 first:border-0 first:pt-0"
                      >
                        {review.rating && (
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating!
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-zinc-600"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                        {review.text && (
                          <p className="text-sm text-zinc-400 leading-relaxed">
                            "{review.text}"
                          </p>
                        )}
                        {review.author && (
                          <p className="text-xs text-zinc-500 mt-2">
                            — {review.author}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-medium mb-2">Delete Deal</h2>
            <p className="text-sm text-zinc-400 mb-6">
              Are you sure you want to delete <strong>{deal.title}</strong>? This action
              cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
