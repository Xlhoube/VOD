"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { MediaItem } from "@/types/media";
import { MediaCard } from "@/components/MediaCard";

interface MediaCarouselProps {
  title: string;
  icon: React.ReactNode;
  items: MediaItem[];
  href?: string;
}

export function MediaCarousel({ title, icon, items, href }: MediaCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!items || items.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const { clientWidth } = scrollRef.current;
    const offset = direction === "left" ? -clientWidth * 0.75 : clientWidth * 0.75;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  return (
    <section className="group/carousel relative space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {icon}
          <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scroll("left")}
              aria-label={`Deslizar ${title} para a esquerda`}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/90 text-zinc-400 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              aria-label={`Deslizar ${title} para a direita`}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/90 text-zinc-400 transition-colors hover:border-zinc-700 hover:bg-zinc-800 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {href && (
            <Link
              href={href}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
            >
              <span>Ver tudo</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>

      <div
        ref={scrollRef}
        className="no-scrollbar flex gap-4 overflow-x-auto pb-4 scroll-smooth"
      >
        {items.slice(0, 15).map((item) => (
          <div
            key={`${item.media_type || "media"}-${item.id}`}
            className="w-[155px] shrink-0 sm:w-[185px]"
          >
            <MediaCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}
