export function DealCardSkeleton() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-video bg-zinc-800" />

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-5 bg-zinc-800 rounded w-3/4" />
        {/* Destination */}
        <div className="h-4 bg-zinc-800 rounded w-1/2" />

        {/* Details */}
        <div className="flex gap-4">
          <div className="h-3 bg-zinc-800 rounded w-16" />
          <div className="h-3 bg-zinc-800 rounded w-20" />
          <div className="h-3 bg-zinc-800 rounded w-24" />
        </div>

        {/* Date */}
        <div className="h-4 bg-zinc-800 rounded w-2/3" />

        {/* Price */}
        <div className="flex items-end justify-between pt-2">
          <div className="space-y-1">
            <div className="h-6 bg-zinc-800 rounded w-20" />
            <div className="h-3 bg-zinc-800 rounded w-16" />
          </div>
          <div className="h-4 bg-zinc-800 rounded w-12" />
        </div>
      </div>
    </div>
  );
}

export function DealCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <DealCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function FiltersSkeleton() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6 animate-pulse space-y-4">
      {/* Destination chips */}
      <div>
        <div className="h-3 bg-zinc-800 rounded w-20 mb-2" />
        <div className="flex gap-2">
          <div className="h-8 bg-zinc-800 rounded-full w-20" />
          <div className="h-8 bg-zinc-800 rounded-full w-24" />
          <div className="h-8 bg-zinc-800 rounded-full w-16" />
          <div className="h-8 bg-zinc-800 rounded-full w-28" />
        </div>
      </div>

      {/* Price and board row */}
      <div className="flex gap-4">
        <div className="flex-1">
          <div className="h-3 bg-zinc-800 rounded w-20 mb-2" />
          <div className="flex gap-2">
            <div className="h-10 bg-zinc-800 rounded flex-1" />
            <div className="h-10 bg-zinc-800 rounded flex-1" />
          </div>
        </div>
        <div>
          <div className="h-3 bg-zinc-800 rounded w-20 mb-2" />
          <div className="flex gap-2">
            <div className="h-8 bg-zinc-800 rounded-full w-24" />
            <div className="h-8 bg-zinc-800 rounded-full w-20" />
          </div>
        </div>
      </div>

      {/* Sort row */}
      <div className="pt-2 border-t border-zinc-800">
        <div className="h-10 bg-zinc-800 rounded w-40" />
      </div>
    </div>
  );
}

export function HotelRowSkeleton() {
  return (
    <tr className="border-b border-zinc-800 animate-pulse">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-800" />
          <div className="space-y-1">
            <div className="h-4 bg-zinc-800 rounded w-32" />
            <div className="h-3 bg-zinc-800 rounded w-20 md:hidden" />
          </div>
        </div>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <div className="h-4 bg-zinc-800 rounded w-24" />
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <div className="h-4 bg-zinc-800 rounded w-12" />
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-end gap-2">
          <div className="w-8 h-8 bg-zinc-800 rounded-lg" />
          <div className="w-8 h-8 bg-zinc-800 rounded-lg" />
        </div>
      </td>
    </tr>
  );
}

export function HotelTableSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-800 text-left text-sm text-zinc-400">
            <th className="px-4 py-3 font-medium">Hotel</th>
            <th className="px-4 py-3 font-medium hidden md:table-cell">Location</th>
            <th className="px-4 py-3 font-medium hidden sm:table-cell">Rating</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: count }).map((_, i) => (
            <HotelRowSkeleton key={i} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
