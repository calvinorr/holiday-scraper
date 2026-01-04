"use client";

import { useRouter } from "next/navigation";
import { ExternalLink, Star, Calendar, Utensils } from "lucide-react";
import { PriceDisplay } from "./PriceDisplay";

export interface Deal {
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

interface DealCardProps {
  deal: Deal;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function DealCard({ deal }: DealCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/deal/${deal.id}`)}
      className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors cursor-pointer"
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
            <PriceDisplay
              savings={deal.originalPrice - deal.price}
              variant="badge"
              className="absolute top-3 left-3"
            />
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
          <PriceDisplay
            price={deal.price}
            pricePerPerson={deal.pricePerPerson}
          />
          <a
            href={deal.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-sm text-zinc-400 hover:text-white flex items-center gap-1"
          >
            Jet2 <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
