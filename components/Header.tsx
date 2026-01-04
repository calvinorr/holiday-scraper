"use client";

import { useRouter } from "next/navigation";
import { Plane, ArrowLeft } from "lucide-react";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  rightContent?: React.ReactNode;
}

export function Header({ title, showBack = false, rightContent }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
        {showBack ? (
          <button
            onClick={() => router.push("/")}
            className="text-zinc-400 hover:text-white flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
        ) : (
          <Plane className="w-6 h-6 text-emerald-500" />
        )}

        <h1 className="text-xl font-semibold tracking-tight flex-1 truncate">
          {title || "Holiday Scraper"}
        </h1>

        {rightContent || (
          <span className="text-sm text-zinc-500">Belfast (BFS)</span>
        )}
      </div>
    </header>
  );
}
