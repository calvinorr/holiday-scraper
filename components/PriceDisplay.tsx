interface PriceDisplayProps {
  price?: number;
  pricePerPerson?: number | null;
  originalPrice?: number | null;
  savings?: number;
  variant?: "default" | "badge" | "large";
  className?: string;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 0,
  }).format(price);
}

export function PriceDisplay({
  price,
  pricePerPerson,
  originalPrice,
  savings,
  variant = "default",
  className = "",
}: PriceDisplayProps) {
  // Savings badge variant
  if (variant === "badge" && savings) {
    return (
      <span
        className={`bg-emerald-500 text-white text-xs font-medium px-2 py-1 rounded ${className}`}
      >
        Save {formatPrice(savings)}
      </span>
    );
  }

  // Large variant (for detail page)
  if (variant === "large" && price) {
    return (
      <div className={className}>
        <div className="flex items-end gap-3 mb-1">
          <span className="text-4xl font-bold text-emerald-400">
            {formatPrice(price)}
          </span>
          {originalPrice && originalPrice > price && (
            <span className="text-lg text-zinc-500 line-through">
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>
        {pricePerPerson && (
          <p className="text-sm text-zinc-400">
            {formatPrice(pricePerPerson)} per person
          </p>
        )}
      </div>
    );
  }

  // Default variant (for cards)
  if (price) {
    return (
      <div className={className}>
        <p className="text-2xl font-bold text-emerald-400">
          {formatPrice(price)}
        </p>
        {pricePerPerson && (
          <p className="text-xs text-zinc-500">
            {formatPrice(pricePerPerson)} pp
          </p>
        )}
      </div>
    );
  }

  return null;
}
